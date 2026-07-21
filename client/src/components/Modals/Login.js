import React from 'react'
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { supabase } from '../../supabase/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const setAuthModalState = useSetRecoilState(authModalState);
  const handleClick = (type) => {
    setAuthModalState((prev) => ({ ...prev, type }));
  };
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState(null);
   
  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!inputs.email || !inputs.password) {
      return alert('Please fill all fields');
    }

    try {
      setLoading(true);
      setError(null);
      setNeedsConfirmation(false);

      const { error } = await supabase.auth.signInWithPassword({
        email: inputs.email,
        password: inputs.password,
      });

      if (error) {
        throw error;
      }

      toast.success('Login successful', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'dark',
      });

      setAuthModalState((prev) => ({ ...prev, isOpen: false, type: 'login' }));
      navigate('/problems');
    } catch (error) {
      const message = error.message || "Unable to sign in";
      setError(error.message);
      if (message.toLowerCase().includes("email not confirmed")) {
        setNeedsConfirmation(true);
      }
      toast.error(message, {
        position: 'top-center',
        autoClose: 3000,
        theme: 'dark',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAuthRedirectUrl = () => {
    if (typeof window === 'undefined') {
      return 'https://codeclash.app/';
    }

    const origin = window.location.origin;
    return origin && origin !== 'null' ? `${origin}/` : 'https://codeclash.app/';
  };

  const handleResendConfirmation = async () => {
    if (!inputs.email) {
      toast.error("Enter your email first", { position: "top-center", theme: "dark" });
      return;
    }

    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: inputs.email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      if (error) throw error;
      toast.success("Confirmation email sent. Please check your inbox.", {
        position: "top-center",
        autoClose: 5000,
        theme: "dark",
      });
    } catch (resendError) {
      toast.error(resendError.message || "Could not resend confirmation email", {
        position: "top-center",
        theme: "dark",
      });
    } finally {
      setResending(false);
    }
  };
  
  return (
    <form className="space-y-6 px-6 pb-4" onSubmit={handleLogin}>
      <h3 className="text-xl font-medium text-white">Sign in to Code Clash</h3>
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Your Email
        </label>
        <input
          onChange={handleInputChange}
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
        <label
          htmlFor="password"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Your Password
        </label>
        <input
          onChange={handleInputChange}
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

      {needsConfirmation && (
        <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-100">
          <p>This account exists, but the email is not confirmed yet.</p>
          <button
            type="button"
            onClick={handleResendConfirmation}
            className="mt-2 font-semibold text-brand-orange hover:underline"
          >
            {resending ? "Sending..." : "Resend confirmation email"}
          </button>
        </div>
      )}

      {error && !needsConfirmation && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white focus:ring-blue-300 font-medium rounded-lg
        text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s disabled:cursor-not-allowed disabled:opacity-60
      ">
        {loading ? "Loading..." : "Log In"}
      </button>
      <button
        type="button"
        className="flex w-full justify-end"
      >
        <a
          href="/"
          className="text-sm block text-brand-orange hover:underline w-full text-right"
          onClick={(event) => {
            event.preventDefault();
            handleClick("forgotPassword");
          }}
        >
          Forgot Password?
        </a>
      </button>
      <div className="text-sm font-medium text-gray-300">
        Not Registered?{" "}
        <button
          type="button"
          className="text-blue-700 hover:underline"
          onClick={() => handleClick("register")}
        >
          Create account
        </button>
      </div>
    </form>
  )
}
