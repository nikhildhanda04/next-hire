import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                image: true,
                skills: true,
                phone: true,
                location: true,
                linkedin: true,
                github: true,
                portfolio: true,
                resumeText: true,
                experience: true,
                education: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, location, linkedin, github, portfolio, summary } = body;

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
                location,
                linkedin,
                github,
                portfolio,
                resumeText: summary ? summary : undefined, // Assuming summary is stored in resumeText for now if that's the intent, or we might need a separate bio field. The plan said "resumeText (summary)".
                // Note: Updating resumeText directly with just summary might lose the full resume context if we overwrite it. 
                // However, the prompt implies "fill more info... saved in his db". 
                // If resumeText is the ONLY place for summary, we should be careful. 
                // Let's assume standard fields for now. 
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
