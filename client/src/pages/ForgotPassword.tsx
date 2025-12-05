import React, { useState } from 'react';
import { ArrowLeft, Loader2, Mail, Lock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Step 1: Email verification schema
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

// Step 2: OTP verification schema
const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Step 3: Password reset schema
const passwordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Step 1: Email form
    const emailForm = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
    });

    // Step 2: OTP form
    const otpForm = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    // Step 3: Password form
    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    // Mutation: Send OTP to email
    const sendOtpMutation = useMutation({
        mutationFn: async (data: { email: string }) => {
            return await apiRequest('POST', '/auth/forgot-password', { email: data.email });
        },
        onSuccess: (response: any) => {
            toast({
                title: 'OTP Sent',
                description: 'Please check your email for the verification code.',
            });
            setStep('otp');
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to send OTP. Please try again.',
                variant: 'destructive',
            });
        },
    });

    // Mutation: Verify OTP
    const verifyOtpMutation = useMutation({
        mutationFn: async (data: { otp: string }) => {
            return await apiRequest('POST', '/auth/verify-otp', {
                email,
                otp: data.otp,
            });
        },
        onSuccess: () => {
            toast({
                title: 'OTP Verified',
                description: 'Please enter your new password.',
            });
            setStep('password');
        },
        onError: (error: Error) => {
            toast({
                title: 'Invalid OTP',
                description: error.message || 'The OTP you entered is incorrect.',
                variant: 'destructive',
            });
        },
    });

    // Mutation: Reset password
    const resetPasswordMutation = useMutation({
        mutationFn: async (data: { password: string }) => {
            return await apiRequest('POST', '/auth/reset-password', {
                email,
                password: data.password,
            });
        },
        onSuccess: () => {
            toast({
                title: 'Password Reset Successful',
                description: 'You can now login with your new password.',
            });
            setTimeout(() => setLocation('/login'), 2000);
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to reset password.',
                variant: 'destructive',
            });
        },
    });

    const onEmailSubmit = (data: any) => {
        setEmail(data.email);
        sendOtpMutation.mutate({ email: data.email });
    };

    const onOtpSubmit = (data: any) => {
        verifyOtpMutation.mutate({ otp: data.otp });
    };

    const onPasswordSubmit = (data: any) => {
        resetPasswordMutation.mutate({ password: data.password });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="flex-1 flex">
                {/* LEFT HERO */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80")',
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-teal-800/70 to-cyan-900/80"></div>
                    <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
                        <div className="max-w-lg text-center">
                            <p className="text-sm font-semibold mb-4 tracking-widest uppercase opacity-90">
                                Password Recovery
                            </p>
                            <h1 className="text-5xl font-bold mb-6 leading-tight">
                                Reset Your Password
                            </h1>
                            <p className="text-lg leading-relaxed opacity-90">
                                We'll help you get back to your wellness journey in just a few steps.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
                    <div className="max-w-md w-full">
                        {/* Back to Login */}
                        <button
                            onClick={() => setLocation('/login')}
                            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </button>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'email' ? 'bg-teal-500 text-white' : step === 'otp' || step === 'password' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}>
                                {step === 'otp' || step === 'password' ? <CheckCircle className="w-5 h-5" /> : '1'}
                            </div>
                            <div className={`w-12 h-1 ${step === 'otp' || step === 'password' ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'otp' ? 'bg-teal-500 text-white' : step === 'password' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}>
                                {step === 'password' ? <CheckCircle className="w-5 h-5" /> : '2'}
                            </div>
                            <div className={`w-12 h-1 ${step === 'password' ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'password' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}>
                                3
                            </div>
                        </div>

                        {/* STEP 1: Email Verification */}
                        {step === 'email' && (
                            <div>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-8 h-8 text-teal-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                                    <p className="text-gray-600">Enter your email to receive a verification code</p>
                                </div>

                                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                                    <div>
                                        <Label>Email Address</Label>
                                        <Input
                                            {...emailForm.register('email')}
                                            type="email"
                                            placeholder="you@example.com"
                                            className={`w-full px-4 py-3 border rounded-lg ${emailForm.formState.errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {emailForm.formState.errors.email && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {emailForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sendOtpMutation.isPending}
                                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        {sendOtpMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Verification Code'
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* STEP 2: OTP Verification */}
                        {step === 'otp' && (
                            <div>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-8 h-8 text-teal-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
                                    <p className="text-gray-600">We sent a 6-digit code to <strong>{email}</strong></p>
                                </div>

                                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
                                    <div>
                                        <Label>Verification Code</Label>
                                        <Input
                                            {...otpForm.register('otp')}
                                            type="text"
                                            maxLength={6}
                                            placeholder="000000"
                                            className={`w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest ${otpForm.formState.errors.otp ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {otpForm.formState.errors.otp && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {otpForm.formState.errors.otp.message}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={verifyOtpMutation.isPending}
                                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        {verifyOtpMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify Code'
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => sendOtpMutation.mutate({ email })}
                                        className="w-full text-teal-600 hover:text-teal-700 text-sm"
                                    >
                                        Didn't receive code? Resend
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* STEP 3: Reset Password */}
                        {step === 'password' && (
                            <div>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-teal-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h2>
                                    <p className="text-gray-600">Enter your new password below</p>
                                </div>

                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                                    <div>
                                        <Label>New Password</Label>
                                        <Input
                                            {...passwordForm.register('password')}
                                            type="password"
                                            placeholder="Enter new password"
                                            className={`w-full px-4 py-3 border rounded-lg ${passwordForm.formState.errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {passwordForm.formState.errors.password && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {passwordForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Confirm Password</Label>
                                        <Input
                                            {...passwordForm.register('confirmPassword')}
                                            type="password"
                                            placeholder="Confirm new password"
                                            className={`w-full px-4 py-3 border rounded-lg ${passwordForm.formState.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {passwordForm.formState.errors.confirmPassword && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {passwordForm.formState.errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={resetPasswordMutation.isPending}
                                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        {resetPasswordMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
