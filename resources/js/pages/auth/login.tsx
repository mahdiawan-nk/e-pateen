import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useState } from "react";
interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
            <Head title="Log in" />
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden flex">
                <div className="w-full lg:w-1/2 p-8 sm:p-12">
                    <div className="mt-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Sign in to continue to your dashboard
                        </p>
                    </div>
                    <div className="relative my-3 text-center">
                        <span className="bg-white dark:bg-gray-800 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                        </span>
                        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200 dark:bg-gray-700 -z-10" />
                    </div>
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">Password</Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="ml-auto text-sm"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                        />
                                        <Label htmlFor="remember">Remember me</Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-4 w-full"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner />}
                                        Log in
                                    </Button>
                                </div>

                                {canRegister && (
                                    <div className="text-center text-sm text-muted-foreground">
                                        Tidak Memiliki Akun?{' '}
                                        <TextLink href={register()} tabIndex={5}>
                                            Daftar Disini Sebagai Pembudidaya
                                        </TextLink>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                </div>
                <div className="hidden lg:flex w-1/2 bg-green-100 dark:bg-gray-400 items-center justify-center">
                    <div
                        className="m-12 w-full h-full bg-contain bg-center bg-no-repeat"
                        style={{
                            backgroundImage:
                                "url('/logo.png')",
                        }}
                    />
                </div>
            </div>
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </div>
    );
}
