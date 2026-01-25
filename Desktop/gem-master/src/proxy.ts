import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Reserved subdomains that cannot be used by stores
const RESERVED_SUBDOMAINS = [
    'www',
    'dashboard',
    'api',
    'admin',
    'app',
    'auth',
    'login',
    'signup',
    'mail',
    'email',
    'support',
    'help',
    'docs',
    'blog',
    'static',
    'cdn',
    'assets',
    'images',
    'img',
    'status',
    'health',
];

// Your production domain
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app';

export async function proxy(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const pathname = request.nextUrl.pathname;

    // Create Supabase client for session management
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // ===== USER STATUS CHECK =====
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_disabled')
            .eq('id', user.id)
            .single();

        if (profile?.is_disabled) {
            // Allow access to the 'not-activated' page
            if (pathname === '/not-activated') {
                return supabaseResponse;
            }

            // Redirect all other requests to 'not-activated'
            const url = request.nextUrl.clone();
            url.pathname = '/not-activated';
            return NextResponse.redirect(url);
        }

        // ===== ADMIN ROUTE PROTECTION =====
        if (pathname.startsWith('/admin')) {
            if (!profile || profile.role !== 'admin') {
                const url = request.nextUrl.clone();
                url.pathname = '/dashboard';
                return NextResponse.redirect(url);
            }
        }
    } else if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect logged-in users away from auth pages
    if (user && (pathname === '/login' || pathname === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // ===== SUBDOMAIN ROUTING =====

    // Check if this is a subdomain request
    const hostParts = host.split('.');

    // Determine if we're on a subdomain
    // Examples: 
    //   mystore.yourdomain.com -> subdomain = 'mystore'
    //   yourdomain.com -> no subdomain
    //   localhost:3000 -> no subdomain
    let subdomain: string | null = null;

    // Handle production domain (e.g., mystore.yourdomain.com)
    if (host.includes(ROOT_DOMAIN) && host !== ROOT_DOMAIN && host !== `www.${ROOT_DOMAIN}`) {
        subdomain = host.replace(`.${ROOT_DOMAIN}`, '');
    }

    // Handle localhost for development (e.g., mystore.localhost:3000)
    if (host.includes('localhost')) {
        const localParts = host.split('.localhost');
        if (localParts.length > 1 && localParts[0]) {
            subdomain = localParts[0];
        }
    }

    // If no subdomain detected, continue normally (main site / dashboard)
    if (!subdomain) {
        return supabaseResponse;
    }

    // Check for reserved subdomains
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
        // Redirect reserved subdomains to main site
        const url = new URL(`https://${ROOT_DOMAIN}${pathname}`);
        return NextResponse.redirect(url);
    }

    // ===== REWRITE SUBDOMAIN REQUESTS TO /store ROUTE =====

    // This is a store subdomain - rewrite to /store path
    // mystore.domain.com/product-1 -> /store/product-1 with subdomain header
    const newUrl = new URL(`/store${pathname === '/' ? '' : pathname}`, request.url);

    // Clone the response and add subdomain as a header for the store route to consume
    const response = NextResponse.rewrite(newUrl);

    // Pass the subdomain to the server component via header
    response.headers.set('x-store-subdomain', subdomain);

    // Copy cookies from supabase response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value);
    });

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
