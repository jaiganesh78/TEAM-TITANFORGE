export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  name: string;
  generateChatCompletion(messages: ChatMessage[], temperature?: number): Promise<string>;
  extractStructuredData(text: string, schemaDescription: string): Promise<any>;
}

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async generateChatCompletion(messages: ChatMessage[], temperature = 0.2): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined.');
    }
    
    // Dynamic load to prevent missing import compile errors
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const result = await model.generateContent({
      contents: userMsgs,
      systemInstruction: systemMsg?.content,
      generationConfig: {
        temperature,
        maxOutputTokens: 2000,
      }
    });

    return result.response.text();
  }

  async extractStructuredData(text: string, schemaDescription: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined.');
    }
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze the following business discovery information and extract a JSON object.
Schema Description:
${schemaDescription}

Source text:
${text}

Return ONLY the valid JSON object. Do not include markdown code block syntax.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    });

    const output = result.response.text();
    return JSON.parse(output);
  }
}

export class LocalLLMProvider implements AIProvider {
  name = 'LocalLLM';
  private endpoint: string;
  private model: string;

  constructor() {
    this.endpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434';
    this.model = process.env.LOCAL_LLM_MODEL || 'llama3';
  }

  async generateChatCompletion(messages: ChatMessage[], temperature = 0.2): Promise<string> {
    const url = `${this.endpoint.replace(/\/$/, '')}/v1/chat/completions`;
    
    console.log(`[LocalLLM] Calling chat completions endpoint: ${url} using model: ${this.model}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI-compatible server returned ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  }

  async extractStructuredData(text: string, schemaDescription: string): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert data extractor. Extract valid JSON according to this schema:\n${schemaDescription}\nReturn ONLY the JSON string. No markdown.`
      },
      {
        role: 'user',
        content: text
      }
    ];

    const content = await this.generateChatCompletion(messages, 0.1);
    try {
      return JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error(`Could not parse JSON from local LLM output: ${content}`);
    }
  }
}

export class MockAIProvider implements AIProvider {
  name = 'MockAI';

  async generateChatCompletion(messages: ChatMessage[], temperature = 0.2): Promise<string> {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    
    if (lastUserMsg.toLowerCase().includes('website') || lastUserMsg.toLowerCase().includes('http')) {
      return JSON.stringify({
        question: "Excellent, I noticed your website has been indexed. What are the core product plans or subscription packages you offer to customers?",
        explanation: "Understanding your products and services pricing tiers enables our revenue and strategy engines to forecast margin models accurately.",
        phase: "PRODUCTS",
        domain: "products-services",
        confidence: 0.5
      });
    }

    return JSON.stringify({
      question: "What is the primary industry sector or vertical that your business operates in, and what is your current business model?",
      explanation: "Knowing your business model (e.g. SaaS, Marketplace, E-commerce) allows the intelligence suite to configure your Growth Twin parameters.",
      phase: "IDENTITY",
      domain: "identity",
      confidence: 0.3
    });
  }

  async extractStructuredData(text: string, schemaDescription: string): Promise<any> {
    console.log(`[MockAI] Mocking structured data extraction for: ${schemaDescription.slice(0, 100)}...`);
    if (schemaDescription.includes('legalName') || schemaDescription.includes('tradeName')) {
      return {
        legalName: 'TitanForge Software Ltd',
        tradeName: 'TitanForge',
        foundedYear: 2024,
        headquarters: 'San Francisco, CA',
        description: 'B2B enterprise AI solutions',
        industry: 'SaaS',
        websiteUrl: 'https://titanforge-demo.com'
      };
    }
    return {};
  }
}

export class GroqProvider implements AIProvider {
  name = 'Groq';
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  async generateChatCompletion(messages: ChatMessage[], temperature = 0.2): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not defined.');
    }

    console.log(`[Groq] Calling chat completions using model: ${this.model}`);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  }

  async extractStructuredData(text: string, schemaDescription: string): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert data extractor. Extract valid JSON according to this schema:\n${schemaDescription}\nReturn ONLY the JSON string. No markdown.`
      },
      {
        role: 'user',
        content: text
      }
    ];

    const content = await this.generateChatCompletion(messages, 0.1);
    try {
      return JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error(`Could not parse JSON from Groq output: ${content}`);
    }
  }
}

export class AIProviderFactory {
  static getProvider(): AIProvider {
    if (process.env.GROQ_API_KEY) {
      console.log('[AIProviderFactory] Using Groq provider.');
      return new GroqProvider();
    }
    if (process.env.GEMINI_API_KEY) {
      console.log('[AIProviderFactory] Using Gemini provider.');
      return new GeminiProvider();
    }
    if (process.env.LOCAL_LLM_ENDPOINT) {
      console.log('[AIProviderFactory] Using LocalLLM provider.');
      return new LocalLLMProvider();
    }
    console.warn('[AIProviderFactory] No AI provider configured — using MockAI.');
    return new MockAIProvider();
  }
}
