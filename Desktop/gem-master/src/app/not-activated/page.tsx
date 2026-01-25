'use client';

import { useEffect, useState } from 'react'; // Added useState
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button'; // Assuming this exists based on login page
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/Logo'; // Assuming this exists based on login page

export default function NotActivatedPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, checkAuth, signOut } = useAppStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Local loading state for logout

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user && !user.is_disabled) {
                // If user is active, they shouldn't be here
                router.push('/dashboard'); 
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (isLoading) {
        return (
             <div className="min-h-screen flex items-center justify-center animated-gradient">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!user) return null; // Should redirect via effect

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
             <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3">
                        <Logo className="h-12" />
                    </div>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <ShieldAlert className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl text-red-600">Account Not Activated</CardTitle>
                        <CardDescription className="pt-2">
                            Your account is currently disabled or pending activation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            You cannot access the dashboard at this time. 
                            Please contact your administrator for assistance.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            variant="outline" 
                            className="w-full h-12 border-red-200 text-red-700 hover:bg-red-50"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4 mr-2" />
                            )}
                            Sign Out
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        </div>
    );
}
