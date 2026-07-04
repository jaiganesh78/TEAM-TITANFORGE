import { prisma } from '../../database/prisma';
import { DiscoveryEngine } from './DiscoveryEngine';
import { DiscoveryPipeline, DISCOVERY_PHASES } from './DiscoveryPipeline';
import { QUESTION_LIBRARY, LibraryQuestion } from './QuestionLibrary';
import { AIProviderFactory } from '../ai/AIProvider';
import { eventBroker } from '../events/EventBroker';
import { AppError } from '../../middleware/errorMiddleware';

export class DiscoveryChatService {
  /**
   * Retrieves or initializes a normalized relational onboarding session.
   */
  static async getOrCreateSession(businessId: string): Promise<any> {
    let session = await prisma.discoveryChatSession.findUnique({
      where: { businessId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!session) {
      // 1. Evaluate current state using existing telemetry engine
      const telemetry = await DiscoveryEngine.evaluateState(businessId);
      const activePhase = DiscoveryPipeline.getActivePhase(telemetry.categoryCoverage);

      // 2. Create session
      session = await prisma.discoveryChatSession.create({
        data: {
          businessId,
          status: 'IN_PROGRESS',
          currentPhase: activePhase.key,
          overallConfidence: telemetry.overallUnderstanding / 100,
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });

      // 3. Create initial greeting message from the AI Consultant
      const firstQuestion = this.selectNextQuestion(activePhase.key, telemetry.activeQuestions, []);
      const welcomeContent = firstQuestion 
        ? `Welcome to TitanForge! I am your Senior Business Consultant. To unlock your organization's AI engines, I'll need to understand your business profile. Let's start with your company details: ${firstQuestion.description}`
        : "Welcome to TitanForge! I will help you build your Growth Digital Twin. To get started, please tell me about your business name and industry vertical.";

      const initialMessage = await prisma.discoveryMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: welcomeContent,
          questionId: firstQuestion?.id || null,
          domain: firstQuestion?.category || 'identity',
          reasonForQuestion: firstQuestion?.whyItMatters || null,
          confidenceBefore: 0,
          confidenceAfter: firstQuestion ? firstQuestion.confidenceImpact : 0
        }
      });

      session.messages = [initialMessage];
    }

    return session;
  }

  /**
   * Submits a user response to the conversational AI consultant loop.
   */
  static async respond(businessId: string, content: string): Promise<any> {
    const session = await this.getOrCreateSession(businessId);
    
    // Find the last assistant question message
    const lastAssistantMsg = [...session.messages]
      .reverse()
      .find((m: any) => m.role === 'assistant');

    if (!lastAssistantMsg || !lastAssistantMsg.questionId) {
      throw new AppError('No active question to respond to.', 400, 'NO_ACTIVE_QUESTION');
    }

    const question = QUESTION_LIBRARY.find((q: any) => q.id === lastAssistantMsg.questionId);
    if (!question) {
      throw new AppError(`Active question not found in library: ${lastAssistantMsg.questionId}`, 404, 'NOT_FOUND');
    }

    // 1. Save user reply as a normalized message
    const userMsg = await prisma.discoveryMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content,
        questionId: question.id,
        domain: question.category
      }
    });

    // 2. Perform AI Structured Data extraction & update GDT model fields in database
    let extractedValue: any = content.trim();

    // If type is number or boolean, try parsing, otherwise parse with AI provider
    if (question.type === 'number') {
      const num = Number(content.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) extractedValue = num;
    } else if (question.type === 'boolean') {
      extractedValue = (content.toLowerCase().includes('yes') || content.toLowerCase().includes('true'));
    }

    // Upsert into GDT
    console.log(`[DiscoveryChatService] Ingesting response for ${question.dbPath}: ${extractedValue}`);
    await DiscoveryEngine.saveAnswer(businessId, question.id, extractedValue, 'KNOWN', 'USER');
    
    // Trigger Twin Update domain event to loose couple other modules
    await eventBroker.publish('TwinUpdated', { businessId, fieldPath: question.dbPath, value: extractedValue });

    // 3. Re-evaluate state telemetry
    const telemetry = await DiscoveryEngine.evaluateState(businessId);
    const activePhase = DiscoveryPipeline.getActivePhase(telemetry.categoryCoverage);
    const phaseProgress = DiscoveryPipeline.getPhaseProgress(activePhase, telemetry.categoryCoverage);

    // 4. Select the next question driven by confidence maximization inside active phase
    const answeredIds = session.messages
      .filter((m: any) => m.role === 'user' && m.questionId)
      .map((m: any) => m.questionId as string);

    const nextQuestion = this.selectNextQuestion(activePhase.key, telemetry.activeQuestions, answeredIds);

    // 5. Update session variables
    const overallConfidence = telemetry.overallUnderstanding / 100;
    const updatedSession = await prisma.discoveryChatSession.update({
      where: { id: session.id },
      data: {
        currentPhase: activePhase.key,
        currentDomain: nextQuestion?.category || null,
        overallConfidence,
        status: activePhase.key === 'VALIDATION' ? 'COMPLETED' : 'IN_PROGRESS'
      }
    });

    // 6. If validation phase is reached, generate the final Executive Review
    let nextContent = '';
    let explanation = '';
    
    if (activePhase.key === 'VALIDATION') {
      nextContent = "I've gathered enough context to map your business model! Before generating your Growth Digital Twin, please review our compiled Executive Business Review Summary. Does this align with your organization?";
      explanation = "This confirmation validates our core assumptions before indexing vectors and launching the strategy, marketing, and lead models.";
    } else if (nextQuestion) {
      nextContent = nextQuestion.description;
      explanation = nextQuestion.whyItMatters || `Understanding your ${nextQuestion.category} helps map optimization vectors.`;
    } else {
      nextContent = "Thank you! I have compiled all necessary details. Let's proceed to the Executive Review.";
    }

    // 7. Save next assistant prompt (no hidden reasoning saved in content)
    const assistantMsg = await prisma.discoveryMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: nextContent,
        questionId: nextQuestion?.id || null,
        domain: nextQuestion?.category || null,
        reasonForQuestion: explanation || null,
        confidenceBefore: overallConfidence,
        confidenceAfter: nextQuestion ? Math.min(1, overallConfidence + (nextQuestion.confidenceImpact || 0.1)) : overallConfidence
      }
    });

    // Trigger ConfidenceChanged domain event
    await eventBroker.publish('ConfidenceChanged', { businessId, overallConfidence });

    return {
      session: updatedSession,
      messages: [...session.messages, userMsg, assistantMsg],
      telemetry,
      activePhase,
      phaseProgress
    };
  }

  /**
   * Helper to select the next question that resides inside the active phase bounds
   * and yields the highest confidence/priority impact.
   */
  private static selectNextQuestion(
    phaseKey: string,
    activeQuestions: LibraryQuestion[],
    answeredIds: string[]
  ): LibraryQuestion | null {
    const phase = DISCOVERY_PHASES.find((p: any) => p.key === phaseKey);
    if (!phase || phaseKey === 'VALIDATION') return null;

    // Filter questions that map to active phase categories and are not yet answered
    const phaseQuestions = activeQuestions.filter(
      (q: any) => phase.categoryKeys.includes(q.category) && !answeredIds.includes(q.id)
    );

    if (phaseQuestions.length === 0) return null;

    // Sort by confidenceImpact desc, then by discoveryPriority desc to maximize value
    const sorted = phaseQuestions.sort((a: any, b: any) => {
      const confidenceDiff = (b.confidenceImpact ?? 0.1) - (a.confidenceImpact ?? 0.1);
      if (Math.abs(confidenceDiff) > 0.001) return confidenceDiff;
      return (b.discoveryPriority ?? 50) - (a.discoveryPriority ?? 50);
    });

    return sorted[0];
  }
}
