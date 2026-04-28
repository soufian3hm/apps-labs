'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            // User should have a session from the reset link
            if (session) {
                setIsValidSession(true);
            }
            setCheckingSession(false);
        };

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            toast.success('Password updated successfully!');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error: any) {
            console.error('Error resetting password:', error);
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>

                    </Link>
                </div>

                <Card className="border-0 shadow-2xl">
                    {success ? (
                        <>
                            <CardHeader className="text-center">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <CardTitle className="text-2xl">Password Updated!</CardTitle>
                                <CardDescription>
                                    Your password has been changed successfully. Redirecting to login...
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Link href="/login" className="w-full">
                                    <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                                        Continue to Sign In
                                    </Button>
                                </Link>
                            </CardFooter>
                        </>
                    ) : !isValidSession ? (
                        <>
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Invalid or Expired Link</CardTitle>
                                <CardDescription>
                                    This password reset link is invalid or has expired. Please request a new one.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Link href="/forgot-password" className="w-full">
                                    <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                                        Request New Link
                                    </Button>
                                </Link>
                            </CardFooter>
                        </>
                    ) : (
                        <>
                            <CardHeader className="text-center">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                                    <Lock className="w-8 h-8 text-orange-600" />
                                </div>
                                <CardTitle className="text-2xl">Set new password</CardTitle>
                                <CardDescription>
                                    Your new password must be different from previous passwords
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter new password"
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
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-12"
                                            disabled={loading}
                                        />
                                    </div>
                                    {password && confirmPassword && password !== confirmPassword && (
                                        <p className="text-sm text-red-500">Passwords do not match</p>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25"
                                        disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
