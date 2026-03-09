'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function RegisterPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as 'student' | 'organization',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await signUp(formData.fullName, formData.email, formData.password);
            router.push('/cases');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
                <p className="text-text-secondary">Join CaseVault and start solving real-world problems</p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Full Name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                />

                <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                />

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                            className={`p-4 rounded-lg border text-left transition-all ${formData.role === 'student'
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-border hover:border-primary-hover'
                                }`}
                        >
                            <div className="font-semibold">Student</div>
                            <div className="text-xs text-text-tertiary mt-1">Solve problems & build portfolio</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'organization' })}
                            className={`p-4 rounded-lg border text-left transition-all ${formData.role === 'organization'
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-border hover:border-primary-hover'
                                }`}
                        >
                            <div className="font-semibold">Organization</div>
                            <div className="text-xs text-text-tertiary mt-1">Post cases & review submissions</div>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full"
                >
                    Create Account
                </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-text-tertiary text-sm">or</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* Login Link */}
            <p className="text-center text-text-secondary">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary-hover font-medium underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
