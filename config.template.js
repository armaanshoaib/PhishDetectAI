export const CONFIG = {
  OPENAI_API_KEY: '', // place your API key
  provider: 'openai',
  model: 'gpt-4o-mini', // Primary model to use
  backupModel: 'gpt-4o', // Fallback model for rate limits/overload

//  // Or for WebLLM local mode:
//   provider: 'webllm',
//   model: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', // Local model to use
};
