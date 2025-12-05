

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

    inputs.forEach(input => {
        if (input.type === 'hidden' || input.disabled) return;

        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const label = findLabel(input)?.toLowerCase() || '';

        // Helper to check matches
        const isMatch = (...keywords) => keywords.some(k =>
            name.includes(k) || id.includes(k) || placeholder.includes(k) || label.includes(k)
        );

        let valueToFill = null;

        // Normalize arrays
        const workExperience = data.work_experience || data.experience || [];
        const educationList = data.education || [];

        // Name
        // Names are almost never textareas. Prevent false positives on "Message" textareas that might have 'name' attribute.
        if (input.tagName !== 'TEXTAREA') {
            if (isMatch('first name', 'firstname')) {
                valueToFill = data.name ? data.name.split(' ')[0] : '';
            } else if (isMatch('last name', 'lastname', 'surname')) {
                valueToFill = data.name ? data.name.split(' ').slice(1).join(' ') : '';
            } else if (isMatch('full name', 'fullname', 'your name', 'name') &&
                !isMatch('username', 'company', 'project', 'host', 'college', 'university', 'school', 'institution', 'employer', 'message', 'cover', 'intro', 'note')) {
                // Avoid matching 'Project Name', 'Company Name', 'Message', or 'Cover Letter' as User Name
                valueToFill = data.name;
            }
        }

        // Email
        else if (isMatch('email') && input.type !== 'file') {
            valueToFill = data.email;
        }

        // Phone
        else if (isMatch('phone', 'mobile', 'tel', 'contact number')) {
            valueToFill = data.phone || data.phone_number || '';
        }

        // Links (Prioritize over Location to avoid "Link Address" or similar confusion)
        else if (isMatch('linkedin')) {
            valueToFill = data.linkedin_url || data.linkedin || '';
        }
        else if (isMatch('github', 'git')) {
            valueToFill = data.github_url || data.github || '';
        }
        else if (isMatch('portfolio', 'website', 'url', 'personal site')) {
            valueToFill = data.portfolio_url || data.portfolio || '';
        }

        // Location
        else if (isMatch('location', 'city', 'address', 'where are you based') &&
            !isMatch('zip', 'postal', 'code', 'pin', 'zipcode', 'job', 'company', 'employer', 'school', 'university', 'college', 'url', 'website', 'link')) {
            // Exclude "Job Location", "Company Address", "School City" etc from using User's Home Location
            valueToFill = data.location || '';
        }

        // Postal Code (Use AI)
        else if (isMatch('zip', 'postal', 'pin code', 'pincode', 'postcode', 'zipcode')) {
            if (!input.value) {
                input.style.border = '2px solid #FF9500';
                input.placeholder = 'Finding postal code...';

                activeInput = input;
                // Clear any previous value if needed, but usually empty if we are here

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

        // Education / University
        else if (isMatch('college', 'university', 'institution', 'school', 'education')) {
            if (Array.isArray(educationList) && educationList.length > schoolIndex) {
                valueToFill = educationList[schoolIndex].institution || '';
                schoolIndex++;
            }
        }

        // Current Job Title (Iterative)
        else if (isMatch('job title', 'role', 'current position', 'designation')) {
            if (Array.isArray(workExperience) && workExperience.length > jobTitleIndex) {
                valueToFill = workExperience[jobTitleIndex].job_title || '';
                jobTitleIndex++;
            }
        }

        // Current Company (Iterative)
        else if (isMatch('company', 'employer', 'current organization') && !isMatch('summary', 'description')) {
            if (Array.isArray(workExperience) && workExperience.length > companyIndex) {
                valueToFill = workExperience[companyIndex].company || '';
                companyIndex++;
            }
        }

        // Smart AI Fields (Generic fallback for known complex fields)
        // We catch these specifically to trigger AI generation
        else if (isMatch('salary', 'expected', 'notice', 'experience', 'years', 'availability', 'gender', 'race', 'ethnicity', 'veteran', 'disability', 'citizenship', 'authorization', 'sponsorship')) {
            if (!input.value) {
                input.style.border = '2px solid #FFCC00'; // Light orange while queued
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
        // Cover Letter / Summary / Open-ended questions
        else if (input.tagName === 'TEXTAREA' ||
            (input.tagName === 'INPUT' && input.type === 'text' &&
                isMatch('why', 'describe', 'tell', 'what', 'how', 'summary', 'about', 'cover'))) {

            // This is a complex field, use AI
            if (!input.value) { // Only fill if empty
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
            input.value = valueToFill;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.style.backgroundColor = '#e6fffa'; // Highlight filled fields
            input.style.border = '2px solid #10b981';

            report.push({
                field: label || placeholder || name || id || 'Unknown Field',
                value: valueToFill.length > 50 ? valueToFill.substring(0, 47) + '...' : valueToFill
            });
        }
    });

    return report;
}
