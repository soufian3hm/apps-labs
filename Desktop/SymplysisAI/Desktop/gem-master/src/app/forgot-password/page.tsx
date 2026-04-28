'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSent(true);
            toast.success('Password reset email sent!');
        } catch (error: any) {
            console.error('Error sending reset email:', error);
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

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
                    {sent ? (
                        <>
                            <CardHeader className="text-center">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <CardTitle className="text-2xl">Check your email</CardTitle>
                                <CardDescription>
                                    We've sent a password reset link to <strong>{email}</strong>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center text-sm text-gray-500">
                                <p>
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => setSent(false)}
                                        className="text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        try again
                                    </button>
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Link href="/login" className="w-full">
                                    <Button variant="outline" className="w-full h-12">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </CardFooter>
                        </>
                    ) : (
                        <>
                            <CardHeader className="text-center">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                                    <Mail className="w-8 h-8 text-orange-600" />
                                </div>
                                <CardTitle className="text-2xl">Forgot password?</CardTitle>
                                <CardDescription>
                                    No worries, we'll send you reset instructions
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email address</Label>
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
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </Button>

                                    <Link href="/login" className="w-full">
                                        <Button variant="ghost" className="w-full">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Sign In
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </form>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
