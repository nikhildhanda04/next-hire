import { NextResponse } from 'next/server';
import { getBrowser, createPage } from '@/lib/scrapers/browser';
import { generateApplicationResponse } from '@/lib/ai/applicationGenerator';

export async function POST(req: Request) {
    try {
        const { job, rawResumeText } = await req.json();

        if (!job || !rawResumeText) {
            return NextResponse.json({ error: 'Missing job or resume data' }, { status: 400 });
        }

        console.log(`Starting auto-apply for ${job.title} at ${job.company}`);

        // 1. Generate Cover Letter
        // We need a job description. If we didn't scrape it fully, we might need to fetch it now.
        // For now, we'll use the title and company as a proxy if description is missing.
        const jobDescription = job.description || `Role: ${job.title} at ${job.company}`;

        let coverLetter = '';
        try {
            coverLetter = await generateApplicationResponse(rawResumeText, jobDescription);
            console.log('Generated cover letter');
        } catch (aiError) {
            console.error('AI Generation failed:', aiError);
            const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
            return NextResponse.json({
                error: 'Failed to generate cover letter. Check API key.',
                details: errorMessage
            }, { status: 500 });
        }

        // 2. Launch Browser to Apply
        // Note: This runs on the server. If local, it opens a browser.
        // We'll use headless: false so the user can see it (if they are running locally)
        // or we can keep it headless and take screenshots.
        // For "Auto Apply", we usually want to see it or have it done in background.
        // Given the user wants to "auto apply", we'll try to automate.

        const browser = await getBrowser();
        const page = await createPage(browser);

        try {
            await page.goto(job.applyLink, { waitUntil: 'networkidle0' });

            // Simple form filling logic (heuristic based)
            // This is very fragile and depends on the specific job board.

            // Example for YC (Work at a Startup)
            if (job.source === 'YC') {
                // Check if we need to login or if there's an apply form
                // YC often requires login. If not logged in, we can't easily apply.
                // We'll log a message and maybe return the cover letter for the user.

                const loginButton = await page.$('button:contains("Log in")'); // Pseudo-selector
                if (loginButton) {
                    console.log('Login required for YC');
                    return NextResponse.json({
                        status: 'requires_login',
                        message: 'Please log in to YC in the browser window or provide cookies.',
                        coverLetter
                    });
                }

                // Try to find textarea for cover letter / message
                const messageInput = await page.$('textarea');
                if (messageInput) {
                    await messageInput.type(coverLetter);
                }
            }

            // For now, we'll just return success with the generated content
            // because full automation without auth is hard.

            return NextResponse.json({
                status: 'success',
                message: 'Application prepared (Cover letter generated)',
                coverLetter
            });

        } catch (error) {
            console.error('Browser automation failed:', error);
            return NextResponse.json({ error: 'Browser automation failed', coverLetter }, { status: 500 });
        } finally {
            await page.close();
        }

    } catch (error) {
        console.error('Error in auto-apply API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
