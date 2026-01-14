'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
    const router = useRouter();
    const { signInWithGoogle, isAuthenticated, checkAuth, isLoading } = useAppStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const supabase = createClient();

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });

        if (error) {
            setLoading(false);
            toast.error(error.message);
            return;
        }

        if (data.user) {
            // Create the profile manually since trigger doesn't work
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: data.user.email!,
                    name,
                });

            if (profileError) {
                // Only log if it's not a duplicate error (profile might already exist from another attempt)
                if (!profileError.message?.includes('duplicate') && profileError.code !== '23505') {
                    console.error('Profile creation error:', profileError.message, profileError.code);
                }
            }

            // Store creation will be handled by the dashboard modal
        }

        setLoading(false);

        if (data.session) {
            toast.success('Account created successfully!');
            await checkAuth();
            router.push('/dashboard');
        } else {
            toast.success('Check your email to confirm your account');
            router.push('/login');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center animated-gradient">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const features = [
        'Unlimited product landing pages',
        'Built-in lead capture forms',
        'Google Sheets integration',
        'Multiple store support',
        'Custom theming options',
    ];

    return (
        <div className="min-h-screen flex animated-gradient">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold gradient-text">GEM</span>
                        </Link>
                    </div>

                    <Card className="border-0 shadow-2xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Create your account</CardTitle>
                            <CardDescription>Start building amazing product pages today</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a password (min 6 chars)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 pr-12"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>

                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12"
                                    onClick={() => signInWithGoogle()}
                                    disabled={loading}
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Sign up with Google
                                </Button>

                                <p className="text-center text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                                        Sign in
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>

            {/* Right side - Features (hidden on mobile) */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-indigo-600 to-purple-700">
                <div className="max-w-md text-white">
                    <h2 className="text-3xl font-bold mb-6">
                        Everything you need to sell online
                    </h2>
                    <div className="space-y-4 mb-8">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="text-lg">{feature}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <p className="text-white/90 italic mb-4">
                            "GEM helped us increase our conversion rate by 40%. The landing pages look incredible!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20"></div>
                            <div>
                                <p className="font-semibold">Sarah Johnson</p>
                                <p className="text-sm text-white/70">Founder, TechStore</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
