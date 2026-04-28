'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const errorParam = searchParams.get('error');
    const { signIn, signInWithGoogle, isAuthenticated, checkAuth, isLoading, user } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (errorParam === 'account_disabled') {
            toast.error('Your account has been disabled. Please contact support.', {
                duration: 5000,
            });
        }
    }, [errorParam]);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            if (user.is_disabled) {
                router.push('/not-activated');
            } else {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            toast.error(error.message || 'Invalid email or password');
            return;
        }

        // State update for user might not be immediate in this closure if we depended purely on 'user' variable from hook
        // But checkAuth() in signIn waits for state update.
        // For safety, we can rely on the useEffect, or check the store directly if needed.
        // However, the useEffect is the most robust way to handle 'already logged in' + 'just logged in' cases uniformly.
        // We will remove the explicit push here and let the useEffect handle it
        // OR we can fetch fresh state.

        toast.success('Welcome back!');
        // router.push('/dashboard'); // Removed, let useEffect handle redirection based on user status
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center animated-gradient">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <Logo className="h-12" />

                    </Link>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome back</CardTitle>
                        <CardDescription>Sign in to your account to continue</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
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
                                        placeholder="Enter your password"
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
                                <div className="flex justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        Forgot password?
                                    </Link>
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
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
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
                                Continue with Google
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/signup" className="font-semibold text-orange-600 hover:text-orange-700">
                                    Sign up
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center animated-gradient">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
