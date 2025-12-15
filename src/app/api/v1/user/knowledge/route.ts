
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const knowledgeSchema = z.object({
    key: z.string().min(1, 'Key is required').max(500),
    value: z.string().min(1, 'Value is required').max(5000),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = knowledgeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { key, value } = validation.data;


        const knowledge = await prisma.userKnowledge.create({
            data: {
                userId: session.user.id,
                key,
                value,
            }
        });

        return NextResponse.json({ success: true, knowledge });

    } catch (error) {
        console.error('Error saving user knowledge:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
