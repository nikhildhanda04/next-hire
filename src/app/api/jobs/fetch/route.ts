import { NextResponse } from 'next/server';
import { scrapeYCJobs } from '@/lib/scrapers/ycScraper';
import { scrapeWellfoundJobs } from '@/lib/scrapers/wellfoundScraper';

export async function GET() {
    try {


        const ycJobs = await scrapeYCJobs();
        const wellfoundJobs = await scrapeWellfoundJobs();

        const allJobs = [...ycJobs, ...wellfoundJobs];

        return NextResponse.json({ jobs: allJobs });
    } catch (error) {
        console.error('Error in job fetch API:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
