'use client';
import { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Tent, ArrowLeft } from 'lucide-react';

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>('LOGIN');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const resetForm = () => {
        setError('');
        setSuccess('');
        setPassword('');
        setConfirmPassword('');
        // Keep email for convenience
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // 2. Update Profile with Name
            await updateProfile(userCredential.user, {
                displayName: fullName
            });
            router.push('/');
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess("If an account exists, a password reset link has been sent to your email.");
            setMode('LOGIN');
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (err: AuthError) => {
        console.error(err);
        let msg = 'An error occurred. Please try again.';
        switch (err.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                msg = 'Invalid email or password.';
                break;
            case 'auth/email-already-in-use':
                msg = 'This email is already registered. Please sign in.';
                break;
            case 'auth/weak-password':
                msg = 'Password should be at least 6 characters.';
                break;
            case 'auth/invalid-email':
                msg = 'Please enter a valid email address.';
                break;
            case 'auth/too-many-requests':
                msg = 'Too many attempts. Please try again later.';
                break;
        }
        setError(msg);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md p-8 glass border-slate-800 animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl shadow-lg shadow-blue-500/20 mb-4">
                        <Tent className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center">Vishawakarma Tent and Building Materials</h1>
                    <p className="text-slate-400">
                        {mode === 'LOGIN' && 'Secure Business Login'}
                        {mode === 'SIGNUP' && 'Create Owner Account'}
                        {mode === 'FORGOT_PASSWORD' && 'Reset Password'}
                    </p>
                </div>

                {/* Feedback Messages */}
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                        {success}
                    </div>
                )}

                {/* --- LOGIN FORM --- */}
                {mode === 'LOGIN' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="owner@business.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <button
                                    type="button"
                                    onClick={() => { resetForm(); setMode('FORGOT_PASSWORD'); }}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                            Sign In
                        </Button>

                        <div className="text-center pt-4 border-t border-slate-800 mt-4">
                            <p className="text-sm text-slate-400 mb-2">Don't have an account?</p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { resetForm(); setMode('SIGNUP'); }}
                                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>
                )}

                {/* --- SIGNUP FORM --- */}
                {mode === 'SIGNUP' && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Full Name</label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="owner@business.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="Min 6 chars"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="Re-enter password"
                                required
                            />
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                            Sign Up
                        </Button>

                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={() => { resetForm(); setMode('LOGIN'); }}
                                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {/* --- FORGOT PASSWORD FORM --- */}
                {mode === 'FORGOT_PASSWORD' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <p className="text-sm text-slate-400 mb-4 text-center">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="owner@business.com"
                                required
                            />
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                            Send Reset Link
                        </Button>

                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={() => { resetForm(); setMode('LOGIN'); }}
                                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                            </button>
                        </div>
                    </form>
                )}

            </Card>

            {/* Important Configuration Reminder for User */}
            <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg backdrop-blur-md text-xs text-yellow-500/80 pointer-events-none">
                <p className="font-bold mb-1">Setup Requirement:</p>
                <p>Ensure `firebase.ts` has valid config and Authentication is enabled in Firebase Console.</p>
            </div>
        </div>
    );
}
