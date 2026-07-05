import { GeminiProvider } from './services/ai/AIProvider';
import dotenv from 'dotenv';
import path from 'path';

// Load .env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGemini() {
  console.log('Initializing GeminiProvider...');
  console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes (Starts with ' + process.env.GEMINI_API_KEY.slice(0, 5) + '...)' : 'No');
  
  const provider = new GeminiProvider();
  
  try {
    console.log('\nSending test completion request to Gemini AI (gemini-2.5-flash)...');
    
    const startTime = Date.now();
    const response = await provider.generateChatCompletion([
      { role: 'user', content: 'Say "TitanForge AI connection is active and healthy!" in a professional corporate tone.' }
    ]);
    
    console.log('\n🎉 SUCCESS! Connection established in ' + (Date.now() - startTime) + 'ms.');
    console.log('Gemini Response:\n----------------------------------------');
    console.log(response.trim());
    console.log('----------------------------------------');
  } catch (error: any) {
    console.error('\n❌ ERROR: Gemini API test failed.');
    console.error('Details:', error.message || error);
  }
}

testGemini();
