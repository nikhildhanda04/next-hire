document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const userInfoDiv = document.getElementById('user-info');
    const userNameSpan = document.getElementById('user-name');
    const autofillBtn = document.getElementById('autofill-btn');
    const errorMsg = document.getElementById('error-msg');
    const reportDiv = document.getElementById('report');
    const reportList = document.getElementById('report-list');

    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveMsg = document.getElementById('save-msg');
    const keyErrorMsg = document.getElementById('key-error-msg');

    let userData = null;

    chrome.storage.local.get(['geminiApiKey', 'openaiApiKey'], (result) => {
        if (result.geminiApiKey) apiKeyInput.value = result.geminiApiKey;
        if (result.openaiApiKey) apiKeyInput.value = result.openaiApiKey;
    });

    saveSettingsBtn.addEventListener('click', () => {
        const rawKey = apiKeyInput.value.trim();

        saveMsg.classList.add('hidden');
        keyErrorMsg.classList.add('hidden');

        if (!rawKey) {
           
            chrome.storage.local.set({
                geminiApiKey: '',
                openaiApiKey: ''
            }, () => {
                saveMsg.textContent = "Keys cleared.";
                saveMsg.classList.remove('hidden');
                setTimeout(() => saveMsg.classList.add('hidden'), 2000);
            });
            return;
        }

        let isGemini = false;
        let isOpenAI = false;

        if (rawKey.startsWith('sk-')) {
            isOpenAI = true;
        } else if (rawKey.startsWith('AIza')) {
            isGemini = true;
        } else {
            keyErrorMsg.textContent = "Unknown key format. Must start with 'sk-' (OpenAI) or 'AIza' (Gemini).";
            keyErrorMsg.classList.remove('hidden');
            return;
        }

        chrome.storage.local.set({
            geminiApiKey: isGemini ? rawKey : '',
            openaiApiKey: isOpenAI ? rawKey : ''
        }, () => {
            saveMsg.innerHTML = "Key Added & AI Access Granted!<br>Happy Form Filling!";
            saveMsg.classList.remove('hidden');
            setTimeout(() => {
                saveMsg.classList.add('hidden');
            }, 4000);
        });
    });


    chrome.runtime.sendMessage({ action: 'fetch-user-data' }, (response) => {
        if (response && response.success) {
            userData = response.data;
            statusDiv.classList.add('hidden');
            userInfoDiv.classList.remove('hidden');
         
            const displayName = userData.name || userData.email;
            userNameSpan.textContent = displayName.length > 20 ? displayName.substring(0, 18) + '...' : displayName;
            autofillBtn.disabled = false;
        } else {
            statusDiv.innerHTML = `
                <div class="status-dot"></div>
                <span>Not logged in</span>
            `;
            autofillBtn.innerHTML = '<span>Login to Next Hire</span>';
            autofillBtn.disabled = false;
            autofillBtn.onclick = () => {
                chrome.runtime.sendMessage({ action: 'open-dashboard' });
            };
        }
    });

    autofillBtn.addEventListener('click', () => {
        if (!userData) return;

        autofillBtn.disabled = true;
        autofillBtn.innerHTML = '<span>Processing...</span>';

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'autofill',
                    data: userData
                }, (response) => {
                    autofillBtn.disabled = false;
                    autofillBtn.innerHTML = '<span>Autofill Application</span>';

                    if (chrome.runtime.lastError) {
              
                        errorMsg.textContent = 'Error: Refresh page or check permissions.';
                        errorMsg.classList.remove('hidden');
                    } else if (response && response.report) {
                      
                        reportList.innerHTML = '';

                        errorMsg.classList.add('hidden');

                        if (response.report.length === 0) {
                            reportList.innerHTML = '<li class="text-gray-400 italic">No fields matched.</li>';
                        } else {
                            response.report.forEach(item => {
                                const li = document.createElement('li');
                                li.innerHTML = `
                                    <span class="field-name" title="${item.field}">${item.field}</span>
                                    <span class="field-value" title="${item.value}">${item.value}</span>
                                `;
                                reportList.appendChild(li);
                            });
                        }
                        reportDiv.classList.remove('hidden');
                    }
                });
            } else {
                autofillBtn.disabled = false;
                autofillBtn.textContent = 'Autofill Application';
            }
        });
    });
});
