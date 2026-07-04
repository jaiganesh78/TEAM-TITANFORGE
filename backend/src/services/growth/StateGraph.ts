import { prisma } from '../../database/prisma';

export interface GraphState {
  businessId: string;
  sessionId: string;
  contextVersion: number;
  
  // Fact data (calculated pre-LLM)
  kpis: Record<string, any>;
  gaps: Record<string, any>;
  readinessReport: any;
  contextPackage: any;

  // Generated inputs/outputs (Zod-validated)
  marketResearch?: any;
  swot?: any;
  competitorAnalysis?: any;
  positioning?: any;
  pricing?: any;
  opportunities?: any;
  recommendations?: any[];
  strategicAssets?: any;

  // Marketing outputs
  audienceAnalysis?: any;
  customerJourney?: any;
  funnelAnalysis?: any;
  channelEvaluation?: any;
  creativeStrategy?: any;
  campaigns?: any[];
  budgetOptimizer?: any;
  experimentPortfolio?: any;
  contentPlan?: any;
  calendar?: any;
  executiveScores?: any;
  marketingRecommendations?: any[];

  // Lead outputs
  icpAnalysis?: any;
  leadSources?: any;
  acquisitionPlan?: any;
  qualificationRules?: any;
  scoringModel?: any;
  segmentation?: any;
  nurtureJourneys?: any;
  forecasts?: any;
  leadPlaybooks?: any[];
  leadRecommendations?: any[];
  leads?: any[];

  // Reflection loop track
  reflectionAttempts: number;
  confidenceScore: number;
  reflectionCritique?: string;

  // Metadata / Logs
  logs: string[];
}

export type NodeFunction = (state: GraphState) => Promise<Partial<GraphState>>;

export class StateGraph {
  public engine: 'strategy' | 'marketing' | 'lead' = 'strategy';
  private nodes: Map<string, NodeFunction> = new Map();
  private order: string[] = [];

  /**
   * Registers a new node function to the graph.
   */
  addNode(name: string, fn: NodeFunction): this {
    this.nodes.set(name, fn);
    this.order.push(name);
    return this;
  }

  /**
   * Executes the entire compiled graph, recording full observability trace details in DB.
   */
  async execute(initialState: GraphState): Promise<GraphState> {
    let state = { ...initialState };
    const traces: any[] = [];
    const startTime = new Date();

    // Create overall execution log
    const execLog = this.engine === 'lead'
      ? await prisma.leadGraphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        })
      : this.engine === 'marketing'
      ? await prisma.marketingGraphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        })
      : await prisma.graphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        });

    state.logs.push(`Starting StateGraph [${this.engine}] execution at ${startTime.toISOString()}`);

    try {
      // Loop over nodes in order
      for (const nodeName of this.order) {
        const nodeFn = this.nodes.get(nodeName);
        if (!nodeFn) continue;

        const nodeStart = new Date();
        state.logs.push(`Node [${nodeName}] started`);

        // Serialize input size estimate
        const inputStr = JSON.stringify(state);
        const inputSize = inputStr.length;

        let outputState: Partial<GraphState> = {};
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let lastError = '';

        while (attempts < maxAttempts && !success) {
          attempts++;
          try {
            outputState = await nodeFn(state);
            success = true;
          } catch (err: any) {
            lastError = err.message;
            state.logs.push(`Node [${nodeName}] attempt ${attempts} failed: ${err.message}`);
          }
        }

        if (!success) {
          throw new Error(`Node [${nodeName}] failed after ${maxAttempts} attempts. Error: ${lastError}`);
        }

        // Apply outputs to current state
        state = { ...state, ...outputState };
        const nodeEnd = new Date();
        const durationMs = nodeEnd.getTime() - nodeStart.getTime();
        const outputSize = JSON.stringify(outputState).length;

        state.logs.push(`Node [${nodeName}] completed in ${durationMs}ms`);

        // Record Node Output in DB for observability
        if (this.engine === 'lead') {
          await prisma.leadGraphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        } else if (this.engine === 'marketing') {
          await prisma.marketingGraphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        } else {
          await prisma.graphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        }

        traces.push({
          nodeName,
          startedAt: nodeStart,
          finishedAt: nodeEnd,
          durationMs,
          success: true,
          attempts
        });
      }

      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();
      state.logs.push(`StateGraph completed in ${totalDuration}ms`);

      // Update execution log
      if (this.engine === 'lead') {
        await prisma.leadGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else if (this.engine === 'marketing') {
        await prisma.marketingGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else {
        await prisma.graphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces)
          }
        });
      }

    } catch (err: any) {
      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();
      state.logs.push(`StateGraph failed: ${err.message}`);

      if (this.engine === 'lead') {
        await prisma.leadGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else if (this.engine === 'marketing') {
        await prisma.marketingGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else {
        await prisma.graphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces)
          }
        });
      }
      throw err;
    }

    return state;
  }
}
