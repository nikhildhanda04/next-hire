

let activeInput = null;
const aiQueue = [];
let isProcessingQueue = false;

function processQueue() {
    if (isProcessingQueue || aiQueue.length === 0) return;

    isProcessingQueue = true;
    const { input, prompt, context } = aiQueue.shift();

    activeInput = input;
    input.value = '';

    input.style.border = '2px solid #FF9500';
    input.placeholder = 'Next Hire AI thinking...';

    chrome.runtime.sendMessage({
        action: 'generate-ai-answer',
        question: prompt,
        context: context
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autofill') {
        const data = request.data;
        console.log('Next Hire DEBUG: Received data:', data);

        try {
            const report = autofillForms(data);
            processQueue(); 
            sendResponse({ success: true, report: report });
        } catch (e) {
            console.error(e);
            sendResponse({ success: false, error: e.toString() });
        }
    }

    if (request.action === 'ai-stream-chunk' && activeInput) {
        activeInput.value += request.chunk;
       
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (request.action === 'ai-stream-complete' && activeInput) {
        activeInput.style.border = '2px solid #10b981'; 
        activeInput.style.backgroundColor = '#ecfdf5';
        activeInput.dispatchEvent(new Event('change', { bubbles: true })); // Final change
        activeInput = null;

    
        isProcessingQueue = false;
        setTimeout(processQueue, 500);
    }

    if (request.action === 'ai-stream-error' && activeInput) {
        
        // Check for specific Exhaustion Error
        if (request.error && (request.error.includes('broke') || request.error.includes('limit') || request.error.includes('quota') || request.error.includes('No API keys available'))) {
            activeInput.style.border = '2px solid red';
            activeInput.placeholder = 'Limit Reached. Add Key.';
            
            // Show Custom Key Input Modal
            showKeyInputModal(request.error);
        } else {
            activeInput.style.border = '2px solid red';
            activeInput.placeholder = 'Error: ' + request.error;
        }
        
        activeInput = null;

        isProcessingQueue = false;
        // setTimeout(processQueue, 500); // Do not auto-continue if error is critical
    }
});

function showKeyInputModal(errorMessage) {
    // Remove existing modal if any
    const existing = document.getElementById('next-hire-key-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'next-hire-key-modal';
    
    // Ensure modal is isolated and on top
    modal.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: #ffffff;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 2147483647; /* Max z-index */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        border: 1px solid #e5e5e5;
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        color: #333;
        line-height: 1.5;
    `;

    modal.innerHTML = `
        <style>
            @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            #next-hire-key-modal * { box-sizing: border-box; }
            .nh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .nh-title { margin: 0; font-size: 16px; font-weight: 700; color: #FF9500; }
            .nh-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; line-height: 1; padding: 0; }
            .nh-close:hover { color: #333; }
            .nh-text { font-size: 13px; color: #4b5563; margin-bottom: 16px; }
            .nh-input { width: 100%; padding: 10px 12px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; outline: none; transition: border-color 0.2s; }
            .nh-input:focus { border-color: #FF9500; ring: 2px solid rgba(255, 149, 0, 0.2); }
            .nh-btn { width: 100%; padding: 10px; background: #FF9500; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: background 0.2s; }
            .nh-btn:hover { background: #e68a00; }
            .nh-status { font-size: 12px; margin-top: 8px; text-align: center; display: none; margin-bottom: 0; }
        </style>
        <div class="nh-header">
            <h3 class="nh-title">Next Hire AI Limit</h3>
            <button id="nh-close-btn" class="nh-close">&times;</button>
        </div>
        <p class="nh-text">
            ${errorMessage.includes('broke') ? "I am broke, my AI Key limits are reached! Add your own key to keep using the AI." : errorMessage}
        </p>
        <input type="password" id="nh-key-input" class="nh-input" placeholder="Paste sk-... or AIza..." autocomplete="off">
        <button id="nh-save-btn" class="nh-btn">Save & Continue</button>
        <p id="nh-status" class="nh-status"></p>
    `;

    document.body.appendChild(modal);

    const inputInput = modal.querySelector('#nh-key-input');
    const saveBtn = modal.querySelector('#nh-save-btn');
    const closeBtn = modal.querySelector('#nh-close-btn');
    const statusMsg = modal.querySelector('#nh-status');

    // Prevent events from bubbling to the page (crucial for some sites)
    modal.addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('keydown', (e) => e.stopPropagation());
    modal.addEventListener('keyup', (e) => e.stopPropagation());
    modal.addEventListener('keypress', (e) => e.stopPropagation());

    // Auto-focus input
    setTimeout(() => inputInput.focus(), 100);

    closeBtn.onclick = (e) => {
        e.stopPropagation();
        modal.remove();
    };
    
    const saveKey = () => {
        const key = inputInput.value.trim();
        
        if (!key) return;

        let isGemini = key.startsWith('AIza');
        let isOpenAI = key.startsWith('sk-');

        if (!isGemini && !isOpenAI) {
            statusMsg.style.color = '#ef4444';
            statusMsg.textContent = 'Invalid Key Format';
            statusMsg.style.display = 'block';
            return;
        }

        chrome.storage.local.set({
            geminiApiKey: isGemini ? key : '',
            openaiApiKey: isOpenAI ? key : ''
        }, () => {
            statusMsg.style.color = '#10b981';
            statusMsg.textContent = 'Key Saved! Resuming...';
            statusMsg.style.display = 'block';
            
            setTimeout(() => {
                modal.remove();
                processQueue(); // Retry current queue
            }, 1000);
        });
    };

    saveBtn.onclick = (e) => {
        e.stopPropagation();
        saveKey();
    };

    inputInput.onkeydown = (e) => {
        e.stopPropagation(); // Essential to type in some sites
        if (e.key === 'Enter') {
            saveKey();
        }
    };
}


function autofillForms(data) {
    function getVisibleContainer() {
        // Prioritize active modals
        const modalSelectors = [
            'div[role="dialog"]',
            '.modal.show',
            '.modal.in',
            '.modal-dialog',
            'div[aria-modal="true"]',
             // Specific for Internshala and common frameworks
            '.modal-content' 
        ];

        for (const selector of modalSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                // Check if actually visible
                if (el.offsetParent !== null && !el.classList.contains('hidden')) {
                    console.log('Next Hire: Detected active modal:', selector);
                    return el;
                }
            }
        }
        return document;
    }

    const container = getVisibleContainer();
    const inputs = container.querySelectorAll('input, textarea, select');
    // If we found a modal, log it
    if (container !== document) {
        console.log(`Next Hire: Scoped autofill to modal with ${inputs.length} inputs.`);
    }

    const report = [];

    let schoolIndex = 0;
    let jobTitleIndex = 0;
    let companyIndex = 0;

    function findLabel(input) {

        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) return label.innerText;
        }

        const parentLabel = input.closest('label');
        if (parentLabel) return parentLabel.innerText;

        const ariaLabel = input.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        let sibling = input.previousElementSibling;
        let checks = 0;
        while (sibling && checks < 3) { 
            if (sibling.innerText && sibling.innerText.length > 0 && sibling.innerText.length < 100) {
                return sibling.innerText;
            }
            sibling = sibling.previousElementSibling;
            checks++;
        }

        const parent = input.parentElement;
        if (parent) {
            let parentSibling = parent.previousElementSibling;
            if (parentSibling && parentSibling.innerText && parentSibling.innerText.length < 100) {
                return parentSibling.innerText;
            }
            const grandParent = parent.parentElement;
            if (grandParent) {
                const grandParentSibling = grandParent.previousElementSibling;
                if (grandParentSibling && grandParentSibling.innerText && grandParentSibling.innerText.length < 100) {
                    return grandParentSibling.innerText;
                }
            }
        }
        return '';
    }

    function setNativeValue(element, value) {
        const valueDescriptor = Object.getOwnPropertyDescriptor(element, 'value');
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueDescriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

        let valueSetter = null;

        if (prototypeValueDescriptor && prototypeValueDescriptor.set && valueDescriptor !== prototypeValueDescriptor) {
            valueSetter = prototypeValueDescriptor.set;
        } else if (valueDescriptor && valueDescriptor.set) {
            valueSetter = valueDescriptor.set;
        }

        if (valueSetter) {
            valueSetter.call(element, value);
        } else {
            element.value = value;
        }

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function findBestOption(select, text) {
        if (!text) return -1;
        const search = text.toLowerCase().trim();

        for (let i = 0; i < select.options.length; i++) {
            const opt = select.options[i];
            const optVal = (opt.value || '').toLowerCase();
            const optText = (opt.innerText || '').toLowerCase();
            if (optVal === search || optText === search) return i;
        }

        for (let i = 0; i < select.options.length; i++) {
            const opt = select.options[i];
            const optText = (opt.innerText || '').toLowerCase().trim();
            if (!optText) continue;

            if (search.includes(optText) || optText.includes(search)) return i;
        }

        return -1;
    }

    inputs.forEach(input => {
        if (input.type === 'hidden' || input.disabled) return;

        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const label = findLabel(input)?.toLowerCase() || '';
        const type = (input.type || '').toLowerCase();
        const autocomplete = (input.autocomplete || '').toLowerCase();
        const automationId = (input.getAttribute('data-automation-id') || '').toLowerCase(); // Workday
        const testId = (input.getAttribute('data-testid') || '').toLowerCase();

        
        const isMatch = (...keywords) => keywords.some(k =>
            name.includes(k) ||
            id.includes(k) ||
            placeholder.includes(k) ||
            label.includes(k) ||
            automationId.includes(k) ||
            testId.includes(k)
        );

        console.log(`Checking input: Name="${name}", ID="${id}", Label="${label}", AutomationID="${automationId}"`);

        let valueToFill = null;

        const workExperience = data.work_experience || data.experience || [];
        const educationList = data.education || [];

        if (input.tagName !== 'TEXTAREA' && isMatch('first name', 'firstname', 'given name')) {
            valueToFill = data.name ? data.name.split(' ')[0] : '';
            console.log('Matched FIRST NAME rule');
        }
        else if (input.tagName !== 'TEXTAREA' && isMatch('last name', 'lastname', 'surname', 'family name')) {
            valueToFill = data.name ? data.name.split(' ').slice(1).join(' ') : '';
            console.log('Matched LAST NAME rule');
        }
        else if (input.tagName !== 'TEXTAREA' && isMatch('full name', 'fullname', 'your name', 'name') &&
            !isMatch('project', 'company', 'host', 'school', 'institution', 'employer', 'message', 'cover', 'intro', 'preferred')) {
            valueToFill = data.name;
            console.log('Matched FULL NAME rule');
        }

        else if ((isMatch('email') || type === 'email' || autocomplete === 'email') && input.type !== 'file') {
            valueToFill = data.email;
            console.log('Matched EMAIL rule');
        }

        else if (isMatch('phone', 'mobile', 'tel', 'contact number')) {
            valueToFill = data.phone || data.phone_number || '';
            console.log('Matched PHONE rule');
        }

        else if (isMatch('linkedin')) {
            valueToFill = data.linkedin_url || data.linkedin || '';
            console.log('Matched LINKEDIN rule');
        }
        else if (isMatch('github', 'git')) {
            valueToFill = data.github_url || data.github || '';
            console.log('Matched GITHUB rule');
        }
        else if (isMatch('portfolio', 'personal site') || (isMatch('website', 'url') && !isMatch('company', 'apply', 'job', 'description', 'employer'))) {
            valueToFill = data.portfolio_url || data.portfolio || '';
            console.log('Matched PORTFOLIO rule');
        }

        else if (isMatch('zip', 'postal', 'pin code', 'pincode', 'postcode', 'zipcode')) {
            console.log('Matched POSTAL CODE rule (Queueing AI)');
            if (!input.value) {
                input.style.border = '2px solid #FF9500';
                input.placeholder = 'Finding postal code...';

                const location = data.location || "the user's location";
                const questionPrompt = `What is the postal code for the address: "${location}"? Return ONLY the code.`;

                aiQueue.push({
                    input: input,
                    prompt: questionPrompt,
                    context: "User Location: " + (data.location || "")
                });

                report.push({
                    field: label || 'Postal Code',
                    value: 'AI is finding...'
                });
            }
        }

        else if (isMatch('city', 'town') && !isMatch('university', 'college', 'school', 'employer', 'address')) {
            console.log('Matched CITY rule (Queueing AI)');
            if (!input.value) {
                input.style.border = '2px solid #FF9500';
                input.placeholder = 'Finding city...';

                const location = data.location || "the user's location";
                const questionPrompt = `What is the city name from the location: "${location}"? Return ONLY the city name.`;

                aiQueue.push({
                    input: input,
                    prompt: questionPrompt,
                    context: "User Location: " + (data.location || "")
                });

                report.push({
                    field: label || 'City',
                    value: 'AI is finding...'
                });
            }
        }

        else if (isMatch('state', 'province', 'region', 'territory') && !isMatch('united states', 'country')) {
            console.log('Matched STATE/PROVINCE rule (Queueing AI)');
            if (!input.value) {
                input.style.border = '2px solid #FF9500';
                input.placeholder = 'Finding state...';

                const location = data.location || "the user's location";
                const questionPrompt = `What is the state/province/region for the location: "${location}"? Return ONLY the state name.`;

                aiQueue.push({
                    input: input,
                    prompt: questionPrompt,
                    context: "User Location: " + (data.location || "")
                });

                report.push({
                    field: label || 'State',
                    value: 'AI is finding...'
                });
            }
        }

        else if (isMatch('address line 1', 'street address', 'address 1') || (isMatch('address') && !isMatch('line 2', 'line 3', 'unit', 'city', 'state', 'zip', 'postal', 'code', 'link', 'url', 'email', 'ip'))) {
            
            console.log('Matched ADDRESS LINE 1 rule (Queueing AI)');
            if (!input.value) {
                input.style.border = '2px solid #FF9500';
                input.placeholder = 'Finding street address...';

                aiQueue.push({
                    input: input,
                    prompt: `What is the street address (Line 1) for the user based on their info? If only city/state is known, suggest a proper format or return the city. User location string is: "${data.location}"`,
                    context: document.body.innerText.substring(0, 500)
                });

                report.push({
                    field: label || 'Address',
                    value: 'AI is finding...'
                });
            }
        }

        else if (isMatch('location', 'where are you based', 'country') &&
            !isMatch('zip', 'postal', 'code', 'pin', 'zipcode', 'job', 'company', 'employer', 'school', 'university', 'college', 'url', 'website', 'link', 'city', 'state', 'street', 'address', 'search', 'alert')) {
            valueToFill = data.location || '';
            console.log('Matched GENERIC LOCATION rule');
        }

        else if (isMatch('college', 'university', 'institution', 'school', 'education')) {
            if (Array.isArray(educationList) && educationList.length > schoolIndex) {
                valueToFill = educationList[schoolIndex].institution || '';
            }
        }

        else if (isMatch('job title', 'role', 'current position', 'designation')) {
            if (Array.isArray(workExperience) && workExperience.length > jobTitleIndex) {
                valueToFill = workExperience[jobTitleIndex].job_title || '';
                jobTitleIndex++;
                console.log('Matched JOB TITLE rule');
            }
        }

        else if (isMatch('company', 'employer', 'current organization') && !isMatch('summary', 'description', 'why', 'interest', 'about', 'working', 'choose', 'website', 'message', 'note')) {
            if (Array.isArray(workExperience) && workExperience.length > companyIndex) {
                valueToFill = workExperience[companyIndex].company || '';
                companyIndex++;
                console.log('Matched COMPANY rule');
            }
        }

        else if (isMatch('salary', 'expected', 'notice', 'experience', 'years', 'availability', 'gender', 'race', 'ethnicity', 'veteran', 'disability', 'citizenship', 'authorization', 'sponsorship')) {
          
            console.log('Matched SMART AI FIELD rule (salary, gender, etc)');
            if (!input.value) {
                input.style.border = '2px solid #FFCC00';
                input.placeholder = 'Queued for AI...';
                aiQueue.push({
                    input: input,
                    prompt: label || placeholder || name || "Question",
                    context: "Page Context: " + document.body.innerText.substring(0, 2000)
                });
                report.push({
                    field: label || 'AI Smart Field',
                    value: 'Queued...'
                });
            }
        }

        else if (input.tagName === 'TEXTAREA' ||
            (input.tagName === 'INPUT' && input.type === 'text' &&
                isMatch('why', 'describe', 'tell', 'what', 'how', 'summary', 'about', 'cover', 'message', 'note'))) {

            console.log('Matched GENERIC AI FIELD rule');
            if (!input.value) {
                input.style.border = '2px solid #FFCC00';
                input.placeholder = 'Queued for AI...';
                aiQueue.push({
                    input: input,
                    prompt: label || placeholder || name || "Tell us about yourself",
                    context: document.body.innerText.substring(0, 5000)
                });
                report.push({
                    field: (label || placeholder || name || 'AI Field') + ' (Queued)',
                    value: 'Queued...'
                });
            }
        } else {
            console.log('NO MATCH FOUND for this input.');
        }

        if (valueToFill) {
            console.log(`MATCH FOUND: Filling "${valueToFill}" into ${name} (${label})`);

            if (input.tagName === 'SELECT') {
                const bestIndex = findBestOption(input, valueToFill);
                if (bestIndex !== -1) {
                    input.selectedIndex = bestIndex;
                    console.log(`DROPDOWN MATCH: Selected index ${bestIndex} ("${input.options[bestIndex].text}")`);
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    console.log(`DROPDOWN NO MATCH: Could not find option for "${valueToFill}"`);
                }
            } else {
            
                input.value = valueToFill;
                input.style.backgroundColor = '#e6fffa';
                input.style.border = '2px solid #10b981';

                try {
                    setNativeValue(input, valueToFill);
                } catch (e) {
                    console.error("Failed to set native value:", e);
                   
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            report.push({
                field: label || placeholder || name || id || 'Unknown Field',
                value: valueToFill.length > 50 ? valueToFill.substring(0, 47) + '...' : valueToFill
            });
        }
    });

    return report;
}
