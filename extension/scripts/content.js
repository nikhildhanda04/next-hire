

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
            processQueue(); // Start queue if any
            sendResponse({ success: true, report: report });
        } catch (e) {
            console.error(e);
            sendResponse({ success: false, error: e.toString() });
        }
    }

    // Stream Handlers
    if (request.action === 'ai-stream-chunk' && activeInput) {
        activeInput.value += request.chunk;
        // Trigger events for reactive forms
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (request.action === 'ai-stream-complete' && activeInput) {
        activeInput.style.border = '2px solid #10b981'; // Green
        activeInput.style.backgroundColor = '#ecfdf5';
        activeInput.dispatchEvent(new Event('change', { bubbles: true })); // Final change
        activeInput = null;

        // Trigger next item in queue
        isProcessingQueue = false;
        setTimeout(processQueue, 500);
    }

    if (request.action === 'ai-stream-error' && activeInput) {
        activeInput.style.border = '2px solid red';
        activeInput.placeholder = 'Error: ' + request.error;
        activeInput = null;

        // Trigger next item even if error
        isProcessingQueue = false;
        setTimeout(processQueue, 500);
    }
});

// Helper function to find label or related text
function findLabel(input) {
    // 1. Check strict <label for="id">
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.innerText;
    }

    // 2. Check parent <label>
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.innerText;

    // 3. Check aria-label or aria-labelledby
    const ariaLabel = input.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (labelElement) return labelElement.innerText;
    }

    // 4. Check preceding sibling (common in React/Tailwind forms)
    // Often <div class="label">Text</div><input>
    let sibling = input.previousElementSibling;
    while (sibling) {
        if (sibling.tagName === 'LABEL' || sibling.tagName === 'DIV' || sibling.tagName === 'SPAN' || sibling.tagName === 'P') {
            // Heuristic: Check if text length is reasonable for a label (< 50 chars)
            if (sibling.innerText && sibling.innerText.length > 0 && sibling.innerText.length < 50) {
                return sibling.innerText;
            }
        }
        sibling = sibling.previousElementSibling;

        // Don't look too far back
        if (!sibling) break;
    }

    // 5. Check parent's previous sibling (wrapped input case)
    // <div><label>Text</label><div><input></div></div>
    const parent = input.parentElement;
    if (parent) {
        let parentSibling = parent.previousElementSibling;
        if (parentSibling && (parentSibling.tagName === 'LABEL' || parentSibling.tagName === 'DIV')) {
            if (parentSibling.innerText && parentSibling.innerText.length < 50) {
                return parentSibling.innerText;
            }
        }
    }

    return '';
}

function autofillForms(data) {
    const inputs = document.querySelectorAll('input, textarea, select');
    const report = [];

    // indices for repetitive fields
    let schoolIndex = 0;
    let jobTitleIndex = 0;
    let companyIndex = 0;

    // Helper to find label or related text (Improved)
    function findLabel(input) {
        // 1. Check strict <label for="id">
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) return label.innerText;
        }

        // 2. Check parent <label>
        const parentLabel = input.closest('label');
        if (parentLabel) return parentLabel.innerText;

        // 3. Check aria-label or aria-labelledby
        const ariaLabel = input.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        // 4. Check preceding sibling (common in React/Tailwind forms)
        let sibling = input.previousElementSibling;
        let checks = 0;
        while (sibling && checks < 3) { // Check closest 3 siblings
            if (sibling.innerText && sibling.innerText.length > 0 && sibling.innerText.length < 100) {
                return sibling.innerText;
            }
            sibling = sibling.previousElementSibling;
            checks++;
        }

        // 5. Check parent's previous sibling (wrapped input case)
        const parent = input.parentElement;
        if (parent) {
            let parentSibling = parent.previousElementSibling;
            if (parentSibling && parentSibling.innerText && parentSibling.innerText.length < 100) {
                return parentSibling.innerText;
            }
            // Go one level higher for deep nesting (common in Workday/Taleo)
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

    // React-compatible value setter
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

        // Helper to check matches
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

        // Normalize arrays
        const workExperience = data.work_experience || data.experience || [];
        const educationList = data.education || [];

        // Name
        if (input.tagName !== 'TEXTAREA') {
            if (isMatch('first name', 'firstname', 'given name')) {
                valueToFill = data.name ? data.name.split(' ')[0] : '';
            } else if (isMatch('last name', 'lastname', 'surname', 'family name')) {
                valueToFill = data.name ? data.name.split(' ').slice(1).join(' ') : '';
            } else if (isMatch('full name', 'fullname', 'your name', 'name') &&
                !isMatch('project', 'company', 'host', 'school', 'institution', 'employer', 'message', 'cover', 'intro')) {
                valueToFill = data.name;
            }
        }

        // Email
        else if ((isMatch('email') || type === 'email' || autocomplete === 'email') && input.type !== 'file') {
            valueToFill = data.email;
        }

        // Phone
        else if (isMatch('phone', 'mobile', 'tel', 'contact number')) {
            valueToFill = data.phone || data.phone_number || '';
        }

        // Links
        else if (isMatch('linkedin')) {
            valueToFill = data.linkedin_url || data.linkedin || '';
        }
        else if (isMatch('github', 'git')) {
            valueToFill = data.github_url || data.github || '';
        }
        else if (isMatch('portfolio', 'website', 'url', 'personal site')) {
            valueToFill = data.portfolio_url || data.portfolio || '';
        }

        // Location - Address Line 1 / City
        else if (isMatch('address line 1', 'street', 'address')) {
            // For Address Line 1, we often just dump the full location or street if we had it. 
            // Since we only have 'location' (e.g. Bhopal, MP), we use that.
            valueToFill = data.location || '';
        }
        else if (isMatch('city', 'town') && !isMatch('university', 'college', 'school', 'employer')) {
            // Extract city if possible, or just use full location string
            valueToFill = data.location ? data.location.split(',')[0].trim() : '';
        }
        else if (isMatch('location', 'where are you based') &&
            !isMatch('zip', 'postal', 'code', 'pin', 'zipcode', 'job', 'company', 'employer', 'school', 'university', 'college', 'url', 'website', 'link')) {
            valueToFill = data.location || '';
        }

        // Postal Code (Use AI)
        else if (isMatch('zip', 'postal', 'pin code', 'pincode', 'postcode', 'zipcode')) {
            if (!input.value) {
                input.style.border = '2px solid #FF9500';
                input.placeholder = 'Finding postal code...';

                activeInput = input;
                const location = data.location || "the user's location";
                const questionPrompt = `What is the postal code for the address: "${location}"? Return ONLY the code.`;

                chrome.runtime.sendMessage({
                    action: 'generate-ai-answer',
                    question: questionPrompt,
                    context: "User Location: " + (data.location || "")
                });

                report.push({
                    field: label || 'Postal Code',
                    value: 'AI is finding...'
                });
            }
        }

        // Education
        else if (isMatch('college', 'university', 'institution', 'school', 'education')) {
            if (Array.isArray(educationList) && educationList.length > schoolIndex) {
                valueToFill = educationList[schoolIndex].institution || '';
                schoolIndex++;
            }
        }

        // Job Title
        else if (isMatch('job title', 'role', 'current position', 'designation')) {
            if (Array.isArray(workExperience) && workExperience.length > jobTitleIndex) {
                valueToFill = workExperience[jobTitleIndex].job_title || '';
                jobTitleIndex++;
            }
        }

        // Company
        else if (isMatch('company', 'employer', 'current organization') && !isMatch('summary', 'description')) {
            if (Array.isArray(workExperience) && workExperience.length > companyIndex) {
                valueToFill = workExperience[companyIndex].company || '';
                companyIndex++;
            }
        }

        // Smart AI Fields
        else if (isMatch('salary', 'expected', 'notice', 'experience', 'years', 'availability', 'gender', 'race', 'ethnicity', 'veteran', 'disability', 'citizenship', 'authorization', 'sponsorship')) {
            // ... existing AI logic
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
        // TextArea / Open-ended
        else if (input.tagName === 'TEXTAREA' ||
            (input.tagName === 'INPUT' && input.type === 'text' &&
                isMatch('why', 'describe', 'tell', 'what', 'how', 'summary', 'about', 'cover'))) {

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
        }

        if (valueToFill) {
            console.log(`MATCH FOUND: Filling "${valueToFill}" into ${name} (${label})`);

            // Try standard value set first for visual feedback
            input.value = valueToFill;
            input.style.backgroundColor = '#e6fffa';
            input.style.border = '2px solid #10b981';

            // Then try React/Native setter
            try {
                setNativeValue(input, valueToFill);
            } catch (e) {
                console.error("Failed to set native value:", e);
                // Fallback to dispatching events on input
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }

            report.push({
                field: label || placeholder || name || id || 'Unknown Field',
                value: valueToFill.length > 50 ? valueToFill.substring(0, 47) + '...' : valueToFill
            });
        }
    });

    return report;
}
