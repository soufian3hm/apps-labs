export function Logo({ className = "h-10" }: { className?: string }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/service-assets/logo/gem.png`;

    return (
        <img
            src={logoUrl}
            alt="Logo"
            className={className}
        />
    );
}
