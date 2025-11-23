import { NextRequest, NextResponse } from 'next/server';
import { analyzeATSWithAI } from '@/app/api/utils/ai-helpers';
import { ATSAnalysisInput } from '@/app/api/types';

export async function POST(request: NextRequest) {
    try {
        const body: ATSAnalysisInput = await request.json();
        
        if (!body.resume_text) {
            return NextResponse.json(
                { detail: 'resume_text is required' },
                { status: 400 }
            );
        }

        if (!body.job_description && !body.career_level) {
            return NextResponse.json(
                { detail: 'Either job_description or career_level must be provided.' },
                { status: 400 }
            );
        }

        const analysisData = await analyzeATSWithAI(
            body.resume_text,
            body.job_description || null,
            body.career_level || null
        );

        return NextResponse.json(analysisData);
    } catch (error) {
        console.error('Error analyzing ATS:', error);
        return NextResponse.json(
            { detail: error instanceof Error ? error.message : 'Error performing ATS analysis with AI model.' },
            { status: 500 }
        );
    }
}

