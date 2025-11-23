import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithAI } from '@/app/api/utils/ai-helpers';
import { ResumeInput } from '@/app/api/types';

export async function POST(request: NextRequest) {
    try {
        const body: ResumeInput = await request.json();
        
        if (!body.resume_text) {
            return NextResponse.json(
                { detail: 'resume_text is required' },
                { status: 400 }
            );
        }

        const parsedData = await parseResumeWithAI(body.resume_text);
        return NextResponse.json(parsedData);
    } catch (error) {
        console.error('Error parsing resume:', error);
        // Log full error details for debugging
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json(
            { 
                detail: error instanceof Error ? error.message : 'Error processing resume with AI model.',
                error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
            },
            { status: 500 }
        );
    }
}

