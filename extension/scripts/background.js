
const API_BASE_URL = 'http://localhost:3000';
// const API_BASE_URL = 'https://next-hire-bice.vercel.app'; 

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
        fetch(`${API_BASE_URL}/api/v1/autofill/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: request.question,
                context: request.context
            }),
            credentials: 'include'
        })
            .then(async response => {
                if (!response.ok) throw new Error('Failed to generate answer');

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

                // Final flush
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

        return true; // Keep channel open (though we use tabs.sendMessage now)
    }
});

