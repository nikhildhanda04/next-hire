// Background script

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handler for fetching user profile (Login check)
    if (request.action === 'fetch-user-data') {
        fetch('http://localhost:3000/api/user/profile', {
            method: 'GET',
            credentials: 'include' // Important: Send cookies
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

        return true; // Indicates we will respond asynchronously
    }

    // Handler for AI Answer Generation
    if (request.action === 'generate-ai-answer') {
        fetch('http://localhost:3000/api/v1/autofill/generate', {
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

