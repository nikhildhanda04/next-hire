
// const API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'https://next-hire-bice.vercel.app';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetch-user-data') {
        fetch(`${API_BASE_URL}/api/user/profile`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Unauthorized or Network Error');
                }
                return response.json();
            })
            .then(data => {
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    if (request.action === 'generate-ai-answer') {

        /* BYOK LOGIC RESTORED */
        chrome.storage.local.get(['geminiApiKey', 'openaiApiKey'], (result) => {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (result.geminiApiKey) headers['x-gemini-api-key'] = result.geminiApiKey;
            if (result.openaiApiKey) headers['x-openai-api-key'] = result.openaiApiKey;

            fetch(`${API_BASE_URL}/api/v1/autofill/generate`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    question: request.question,
                    context: request.context
                }),
                credentials: 'include'
            })
                .then(async response => {
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `Server Error: ${response.status}`);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        chrome.tabs.sendMessage(sender.tab.id, {
                            action: 'ai-stream-chunk',
                            chunk: chunk
                        });
                    }

                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'ai-stream-complete'
                    });
                })
                .catch(error => {
                    console.error('AI Generation error:', error);
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'ai-stream-error',
                        error: error.message
                    });
                });
        });

        return true;
    }

    if (request.action === 'open-dashboard') {
        chrome.tabs.create({ url: API_BASE_URL });
        return true;
    }
});

