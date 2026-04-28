import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. Verify that the requester is an admin
        const supabase = await createClient();
        const { data: { user: requester } } = await supabase.auth.getUser();

        if (!requester) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', requester.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Get the target user ID from the request
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 3. Use the Service Role client to generate a magic link for the target user
        // We use admin.generateLink with type 'magiclink' (or 'recovery')
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: (await supabaseAdmin.from('profiles').select('email').eq('id', userId).single()).data?.email,
            options: {
                redirectTo: `${new URL(request.url).origin}/dashboard`
            }
        });

        if (error || !data?.properties?.action_link) {
            return NextResponse.json({ error: error?.message || 'Failed to generate impersonation link' }, { status: 500 });
        }

        // 4. Return the magic link to the client
        return NextResponse.json({ link: data.properties.action_link });

    } catch (error: any) {
        console.error('Impersonation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
