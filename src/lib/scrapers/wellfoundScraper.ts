import { getBrowser, createPage } from './browser';
import { Job } from '@/app/store/jobStore';

export async function scrapeWellfoundJobs(): Promise<Job[]> {
    const browser = await getBrowser();
    const page = await createPage(browser);

    try {
        // Go to Wellfound jobs page filtered for interns
        await page.goto('https://wellfound.com/jobs?roles=Intern', {
            waitUntil: 'networkidle0',
            timeout: 60000,
        });

        // Wellfound might require login or show a limited view.
        // We'll try to scrape what's visible.

        // Wait for job listings
        try {
            await page.waitForSelector('[data-test="JobListItem"]', { timeout: 10000 });
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
