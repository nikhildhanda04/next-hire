document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const userInfoDiv = document.getElementById('user-info');
    const userNameSpan = document.getElementById('user-name');
    const autofillBtn = document.getElementById('autofill-btn');
    const errorMsg = document.getElementById('error-msg');
    const reportDiv = document.getElementById('report');
    const reportList = document.getElementById('report-list');

    let userData = null;

    // Check login status via background script
    chrome.runtime.sendMessage({ action: 'fetch-user-data' }, (response) => {
        if (response && response.success) {
            userData = response.data;
            statusDiv.classList.add('hidden');
            userInfoDiv.classList.remove('hidden');
            // Display name or truncated email
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

        // Visual feedback
        autofillBtn.disabled = true;
        autofillBtn.innerHTML = '<span>Processing...</span>';

        // Send message to active tab content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'autofill',
                    data: userData
                }, (response) => {
                    autofillBtn.disabled = false;
                    autofillBtn.innerHTML = '<span>Autofill Application</span>';

                    if (chrome.runtime.lastError) {
                        // Content script likely not loaded yet or page error
                        errorMsg.textContent = 'Error: Refresh page or check permissions.';
                        errorMsg.classList.remove('hidden');
                    } else if (response && response.report) {
                        // Display Report
                        reportList.innerHTML = '';

                        // Clear error if success
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
