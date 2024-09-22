// scripts.js

function log(message) {
    console.log('[OpenAI ChatGPT Assistant]', message);
  }
  
  function findContentEditableDiv() {
    return document.querySelector('div[contenteditable="true"]#prompt-textarea');
  }
  
  function waitForContentEditableDiv() {
    return new Promise((resolve, reject) => {
      const div = findContentEditableDiv();
      if (div) {
        resolve(div);
      } else {
        const observer = new MutationObserver(() => {
          const div = findContentEditableDiv();
          if (div) {
            observer.disconnect();
            resolve(div);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }
  
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  function sendRequestToAPI(userInput) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'fetchFromAPI', userInput: userInput },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
            return;
          }
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.assistantReply);
          }
        }
      );
    });
  }
  
  function handleInputChange(event) {
    const div = event.target;
    const userInput = div.innerText.trim();
    if (userInput.length === 0 || userInput.length < 20) {
      return;
    }
    log('User input detected. Sending request to API.');
    sendRequestToAPI(userInput)
      .then((assistantReply) => {
        log('Received reply from API.');
        // Create a new paragraph element for the assistant's reply
        const replyParagraph = document.createElement('span');
        // leave one word space between the user input and the assistant's reply
        replyParagraph.innerText = ' ';
        replyParagraph.innerText = assistantReply;
        // Append the assistant's reply after the user's input
        div.appendChild(replyParagraph);
        // make the whole input text in one line
        div.style.whiteSpace = 'nowrap';
      })
      .catch((error) => {
        console.error('[OpenAI ChatGPT Assistant] Error:', error);
      });
  }
  
  waitForContentEditableDiv()
    .then((div) => {
      log('ContentEditable div found.');
      const debouncedInputHandler = debounce(handleInputChange, 3000);
      div.addEventListener('input', debouncedInputHandler);
    })
    .catch((error) => {
      console.error('[OpenAI ChatGPT Assistant] Error:', error);
    });
  