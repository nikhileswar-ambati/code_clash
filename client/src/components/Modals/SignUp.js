import React from 'react'
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { useState } from 'react';
import { supabase } from '../../supabase/supabase';
import { toast } from 'react-toastify'

export default function SignUp() {
    const setAuthModalState = useSetRecoilState(authModalState);
    const handleClick = (type) => {
        setAuthModalState((prev) => ({ ...prev, type }));
    }; 
    const [inputs, setInputs] = useState({
        name: '',
        email: '',
        displayName: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmationEmail, setConfirmationEmail] = useState("");

    const handleChangeInput = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getAuthRedirectUrl = () => {
        if (typeof window === 'undefined') {
            return 'https://codeclash.app/';
        }

        const origin = window.location.origin;
        return origin && origin !== 'null' ? `${origin}/` : 'https://codeclash.app/';
    };

    const handleRegister = async (e) => {
        e.preventDefault();
    
        if (!inputs.email || !inputs.password || !inputs.displayName) {
            return alert("Please fill all required fields");
        }
    
        try {
            setLoading(true);
            setError(null);
            toast.loading("Creating your account", { position: "top-center", toastId: "loadingToast" });
            const { data: signUpData, error } = await supabase.auth.signUp({
                email: inputs.email,
                password: inputs.password,
                options: {
                    emailRedirectTo: getAuthRedirectUrl(),
                    data: {
                        displayName: inputs.displayName,
                        name: inputs.name,
                    },
                },
            });
    
            if (error) {
                throw error;
            } else {
                if (signUpData.session && signUpData.user?.id) {
                    const { error: linkError } = await supabase
                        .from('users')
                        .upsert([
                            {
                                user_id: signUpData.user.id,
                                email: inputs.email,
                                displayName: inputs.displayName,
                                name: inputs.name,
                            },
                        ]);

                    if (linkError) {
                        console.error('Error linking user with users table:', linkError.message);
                    }
                }
            }

            setConfirmationEmail(inputs.email);
            setAuthModalState((prev) => ({ ...prev, isOpen: false, type: 'login' }));
            toast.success("Account created. Please confirm your email before signing in.", {
                position: "top-center",
                autoClose: 5000,
                theme: "dark",
            });
        } catch (error) {
            setError(error.message);
            toast.error(error.message, { position: "top-center" });
        } finally {
            setLoading(false);
            toast.dismiss("loadingToast");
        }
    };
    
    return (
        <form className="space-y-6 px-6 pb-4 max-h-[80vh] overflow-y-auto" onSubmit={handleRegister}>
            <h3 className="text-xl font-medium text-white my-10">Register to Code Clash</h3>

            {confirmationEmail && (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                    <p className="font-semibold">Please confirm your email.</p>
                    <p className="mt-1">We sent a confirmation link to {confirmationEmail}. After confirming, sign in with the same email and password.</p>
                </div>
            )}

            {error && (
                <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
            )}
            
            <div>
                <label htmlFor="name" className="text-sm font-medium block mb-2 text-gray-300">
                    Name
                </label>
                <input
                    onChange={handleChangeInput}
                    type="text"
                    name="name"
                    id="name"
                    className="
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                        bg-gray-600 border-gray-500 placeholder-gray-400 text-white
                    "
                    placeholder="John Doe"
                />
            </div>
            <div>
                <label htmlFor="email" className="text-sm font-medium block mb-2 text-gray-300">
                    Email
                </label>
                <input
                    onChange={handleChangeInput}
                    type="email"
                    name="email"
                    id="email"
                    className="
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                        bg-gray-600 border-gray-500 placeholder-gray-400 text-white
                    "
                    placeholder="name@company.com"
                />
            </div>
            <div>
                <label htmlFor="displayName" className="text-sm font-medium block mb-2 text-gray-300">
                    Display Name
                </label>
                <input
                    onChange={handleChangeInput}
                    type="text"
                    name="displayName"
                    id="displayName"
                    className="
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                        bg-gray-600 border-gray-500 placeholder-gray-400 text-white
                    "
                    placeholder="John Doe"
                />
            </div>
            <div>
                <label htmlFor="password" className="text-sm font-medium block mb-2 text-gray-300">
                    Password
                </label>
                <input
                    onChange={handleChangeInput}
                    type="password"
                    name="password"
                    id="password"
                    className="
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                        bg-gray-600 border-gray-500 placeholder-gray-400 text-white
                    "
                    placeholder="*******"
                />
            </div>

            <button
                type="submit"
                disabled={loading || Boolean(confirmationEmail)}
                className="w-full text-white focus:ring-blue-300 font-medium rounded-lg
                    text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s disabled:cursor-not-allowed disabled:opacity-60
                "
            >
                {loading ? "Registering..." : "Register"}
            </button>

            <div className="text-sm font-medium text-gray-300">
                Already have an account?{" "}
                <button
                    type="button"
                    className="text-blue-700 hover:underline"
                    onClick={() => handleClick("login")}
                >
                    Log In
                </button>
            </div>
        </form>
    )
}
