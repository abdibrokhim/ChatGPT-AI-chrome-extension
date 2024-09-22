// background.js

const OPENAI_API_KEY = 'YOUR_API_KEY_HERE';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchFromAPI') {
    const userInput = request.userInput;
    if (OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
      sendResponse({ error: 'OpenAI API key is not set in background.js.' });
      return;
    }
    const data = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. You will complete user-provided sentences or phrases with 3 or 4 words that continue or complete the thought.  Your responses should act as an AI-powered search engine, providing relevant and accurate information. Avoid using punctuation in your responses. Only return newly generated text, not the user input.',
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
    };
    fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + OPENAI_API_KEY,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            sendResponse({ error: errData });
          });
        }
        return response.json().then((json) => {
          if (
            json &&
            json.choices &&
            json.choices.length > 0 &&
            json.choices[0].message &&
            json.choices[0].message.content
          ) {
            const assistantReply = json.choices[0].message.content.trim();
            sendResponse({ assistantReply: assistantReply });
          } else {
            sendResponse({ error: 'Invalid response from OpenAI API.' });
          }
        });
      })
      .catch((error) => {
        sendResponse({ error: error.toString() });
      });
    // Indicate that sendResponse will be called asynchronously
    return true;
  }
});