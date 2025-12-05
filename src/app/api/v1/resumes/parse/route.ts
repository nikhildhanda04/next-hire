import { NextRequest, NextResponse } from 'next/server';
import { parseResumeWithAI } from '@/app/api/utils/ai-helpers';
import { ResumeInput } from '@/app/api/types';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

        // Attempt to save to DB if user is authenticated
        try {
            const session = await auth.api.getSession({
                headers: await headers()
            });

            if (session?.user) {
                // Flatten skills for simple array storage
                const skills: string[] = [];
                if (parsedData.categorized_skills) {
                    Object.values(parsedData.categorized_skills).forEach((skillList) => {
                        if (Array.isArray(skillList)) {
                            skills.push(...skillList);
                        }
                    });
                }

                await prisma.user.update({
                    where: { id: session.user.id },
                    data: {
                        resumeText: body.resume_text,
                        skills: skills,
                        phone: parsedData.phone_number,
                        location: parsedData.location,
                        linkedin: parsedData.linkedin_url,
                        github: parsedData.github_url,
                        portfolio: parsedData.portfolio_url,
                        experience: parsedData.work_experience ? JSON.parse(JSON.stringify(parsedData.work_experience)) : undefined,
                        education: parsedData.education ? JSON.parse(JSON.stringify(parsedData.education)) : undefined,
                    }
                });
                console.log(`Saved resume data for user ${session.user.id}`);
            }
        } catch (dbError) {
            console.error('Error saving to DB (non-fatal):', dbError);
            // We don't block the response if DB save fails, just log it
        }

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

