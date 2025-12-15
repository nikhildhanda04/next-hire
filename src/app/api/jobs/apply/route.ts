import { NextResponse } from 'next/server';
import { getBrowser, createPage } from '@/lib/scrapers/browser';
import { generateApplicationResponse } from '@/lib/ai/applicationGenerator';

export async function POST(req: Request) {
    try {
        const { job, rawResumeText } = await req.json();

        if (!job || !rawResumeText) {
            return NextResponse.json({ error: 'Missing job or resume data' }, { status: 400 });
        }



        const jobDescription = job.description || `Role: ${job.title} at ${job.company}`;

        let coverLetter = '';
        try {
            coverLetter = await generateApplicationResponse(rawResumeText, jobDescription);

        } catch (aiError) {
            console.error('AI Generation failed:', aiError);
            const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
            return NextResponse.json({
                error: 'Failed to generate cover letter. Check API key.',
                details: errorMessage
            }, { status: 500 });
        }


        const browser = await getBrowser();
        const page = await createPage(browser);

        try {
            await page.goto(job.applyLink, { waitUntil: 'networkidle0' });

            if (job.source === 'YC') {

                const loginButton = await page.$('button:contains("Log in")'); // Pseudo-selector
                if (loginButton) {

                    return NextResponse.json({
                        status: 'requires_login',
                        message: 'Please log in to YC in the browser window or provide cookies.',
                        coverLetter
                    });
                }

                const messageInput = await page.$('textarea');
                if (messageInput) {
                    await messageInput.type(coverLetter);
                }
            }

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
