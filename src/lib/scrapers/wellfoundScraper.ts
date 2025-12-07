import { getBrowser, createPage } from './browser';
import { Job } from '@/app/store/jobStore';

export async function scrapeWellfoundJobs(): Promise<Job[]> {
    const browser = await getBrowser();
    const page = await createPage(browser);

    // Set headers to mimic a real user
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://google.com',
        'Cache-Control': 'no-cache',
    });

    try {
        // Go to Wellfound jobs page filtered for interns
        await page.goto('https://wellfound.com/jobs?roles=Intern', {
            waitUntil: 'domcontentloaded', // We relax this to avoid network idle timeouts
            timeout: 60000,
        });

        // Add a small delay to allow dynamic content to start loading or key checks
        try {
            await page.waitForSelector('[data-test="JobListItem"]', { timeout: 30000 });
        } catch (e) {
            console.log('Primary selector wait timed out, attempting extraction anyway...');
            // Save HTML for debugging
            const fs = await import('fs');
            const content = await page.content();
            fs.writeFileSync('debug-wellfound.html', content);
            console.log('Saved debug-wellfound.html');
        }

        // Wait for job listings (second check, maybe redundant but safe)
        try {
            // We already waited above, but let's keep a short check or skip if we are sure it failed
            if (!await page.$('[data-test="JobListItem"]')) {
                throw new Error('Selector not found after initial wait');
            }
        } catch {
            console.log('Timeout waiting for Wellfound selectors, might be blocked or empty');
            return [];
        }

        const jobs = await page.evaluate(() => {
            const jobElements = document.querySelectorAll('[data-test="JobListItem"]');
            const scrapedJobs: { id: string; title: string; company: string; location: string; applyLink: string; source: string; status: string; description: string }[] = [];

            jobElements.forEach((el) => {
                const titleEl = el.querySelector('[data-test="JobTitle"]');
                const companyEl = el.querySelector('[data-test="CompanyInfo"]'); // This might need adjustment
                const locationEl = el.querySelector('[data-test="JobLocation"]'); // Guessing selector
                const linkEl = el.querySelector('a[href*="/jobs/"]');

                const title = titleEl?.textContent?.trim() || 'Unknown Role';
                const company = companyEl?.textContent?.trim() || 'Unknown Company';
                const location = locationEl?.textContent?.trim() || 'Remote';
                const href = linkEl?.getAttribute('href');

                if (href) {
                    const applyLink = href.startsWith('http') ? href : `https://wellfound.com${href}`;
                    const id = href.split('/').pop() || Math.random().toString(36).substr(2, 9);

                    scrapedJobs.push({
                        id,
                        title,
                        company,
                        location,
                        applyLink,
                        source: 'Wellfound',
                        status: 'new',
                        description: '',
                    });
                }
            });

            return scrapedJobs;
        });

        return jobs as Job[];

    } catch (error) {
        console.error('Error scraping Wellfound jobs:', error);
        return [];
    } finally {
        await page.close();
    }
}
