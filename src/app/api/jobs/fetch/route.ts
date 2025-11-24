import { NextResponse } from 'next/server';
import { scrapeYCJobs } from '@/lib/scrapers/ycScraper';
import { scrapeWellfoundJobs } from '@/lib/scrapers/wellfoundScraper';

export async function GET() {
    try {
        console.log('Starting job fetch...');
        const ycJobs = await scrapeYCJobs();
        console.log(`Fetched ${ycJobs.length} jobs from YC`);

        const wellfoundJobs = await scrapeWellfoundJobs();
        console.log(`Fetched ${wellfoundJobs.length} jobs from Wellfound`);

        const allJobs = [...ycJobs, ...wellfoundJobs];

        return NextResponse.json({ jobs: allJobs });
    } catch (error) {
        console.error('Error in job fetch API:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
