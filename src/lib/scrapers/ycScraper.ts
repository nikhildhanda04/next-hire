import { getBrowser, createPage } from './browser';
import { Job } from '@/app/store/jobStore';

export async function scrapeYCJobs(): Promise<Job[]> {
    const browser = await getBrowser();
    const page = await createPage(browser);

    try {
        // Go to YC Work at a Startup jobs page filtered for interns
        await page.goto('https://www.workatastartup.com/jobs?roles=Intern', {
            waitUntil: 'networkidle0',
            timeout: 60000,
        });

        // Wait for job items to load
        // YC jobs are usually in a list. We'll look for elements that look like job cards.
        // The selectors might need adjustment based on actual class names which are often hashed.
        // We'll use a more generic strategy finding links that look like job posts.
        await page.waitForSelector('div.job-name a', { timeout: 10000 }).catch(() => console.log('Timeout waiting for selector'));

        const jobs = await page.evaluate(() => {
            // Let's try to find all job cards by looking for the company logo or specific structure
            // A better approach for YC might be to find all elements that link to /companies/.../jobs/...

            const jobLinks = Array.from(document.querySelectorAll('a[href*="/jobs/"]'));
            const uniqueJobs = new Map<string, { id: string; title: string; company: string; location: string; applyLink: string; source: string; status: string; description: string }>();

            jobLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || !href.includes('/companies/')) return;

                // Attempt to find the container of the job card
                // We'll traverse up until we find a container that has both the job link and a company link
                let container = link.parentElement;
                let companyLink = null;
                let attempts = 0;

                while (container && attempts < 5) {
                    // Look for a link to /companies/ that is NOT a job link
                    const possibleCompanyLink = container.querySelector('a[href*="/companies/"]:not([href*="/jobs/"])');
                    if (possibleCompanyLink) {
                        companyLink = possibleCompanyLink;
                        break;
                    }
                    container = container.parentElement;
                    attempts++;
                }

                // If we found a container and company link, use them
                // If not, fall back to previous logic or defaults

                const titleElement = link; // The job link itself usually contains the title
                const locationText = container?.querySelector('.job-location')?.textContent?.trim() || container?.innerText.match(/Location:\s*(.*)/)?.[1] || 'Remote';
                const locationElement = typeof locationText === 'string' ? locationText : 'Remote';

                const title = titleElement?.textContent?.trim() || 'Unknown Role';

                // Clean up company name (remove (W12) etc if desired, or keep it)
                // Example: "Amplitude (W12) • Digital Analytics Platform" -> "Amplitude"
                let company = 'Unknown Company';
                if (companyLink) {
                    const rawCompany = companyLink.textContent?.trim() || '';
                    company = rawCompany.split('(')[0].trim(); // Simple cleanup
                    if (!company) company = rawCompany; // Fallback if split fails
                }

                // Construct full URL
                const applyLink = href.startsWith('http') ? href : `https://www.workatastartup.com${href}`;

                // Create a unique ID based on the URL
                const id = href.split('/').pop() || Math.random().toString(36).substr(2, 9);

                if (!uniqueJobs.has(id)) {
                    uniqueJobs.set(id, {
                        id,
                        title,
                        company,
                        location: locationElement || 'Remote', // Default to Remote if not found
                        applyLink,
                        source: 'YC',
                        status: 'new',
                        description: '',
                    });
                }
            });

            return Array.from(uniqueJobs.values());
        });

        return jobs as Job[];

    } catch (error) {
        console.error('Error scraping YC jobs:', error);
        return [];
    } finally {
        await page.close();
    }
}
