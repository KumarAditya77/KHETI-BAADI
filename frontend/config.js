// Configuration for the Kheti Baadi application
const CONFIG = {
    // Get your API key from https://platform.openai.com/api-keys
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    
    // AI Model configuration
    AI_MODEL: 'gpt-3.5-turbo',
    AI_TEMPERATURE: 0.7,
    AI_MAX_TOKENS: 500
};

// Make sure the config is properly exported
if (typeof module !== 'undefined' && module.exports) {
    // For Node.js/CommonJS
    module.exports = CONFIG;
}
