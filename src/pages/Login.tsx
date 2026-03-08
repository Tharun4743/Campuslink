import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { BookOpen, KeyRound, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

type ViewState = 'login' | 'forgot-email' | 'forgot-reset' | 'success';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState("");
  const [view, setView] = useState<ViewState>('login');
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (res.ok) {
        const user = await res.json();
        login(user);
        if (user.role === "student") {
          navigate("/student-dashboard");
        } else {
          navigate("/teacher-dashboard");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to server. Try offline mode?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setView('forgot-reset');
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send OTP. Are you registered?");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (res.ok) {
        setView('success');
        setTimeout(() => {
          setView('login');
          setPassword("");
          setOtp("");
          setNewPassword("");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password. Invalid OTP.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">

        {/* Top Decorative Blur */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

        {view === 'login' && (
          <>
            <div>
              <div className="mx-auto h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex justify-center items-center shadow-inner">
                <BookOpen size={36} strokeWidth={2.5} />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-center text-sm text-gray-500">
                Sign in to your CampusLink account
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
              <div className="flex justify-center p-1 bg-gray-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-all ${role === 'student' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-all ${role === 'teacher' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Teacher
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-gray-400 text-gray-900 bg-gray-50 hover:bg-white transition-colors"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-gray-400 text-gray-900 bg-gray-50 hover:bg-white transition-colors"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => { setView('forgot-email'); setError(''); }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <span className="flex-1">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center text-sm font-medium text-gray-500 pt-2">
                Don't have an account? <Link to={role === 'teacher' ? "/signup/teacher" : "/signup/student"} className="text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4">Sign up</Link>
              </div>
            </form>
          </>
        )}

        {view === 'forgot-email' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => { setView('login'); setError(''); }}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="mt-4">
              <div className="mx-auto h-16 w-16 bg-purple-50 text-purple-600 rounded-2xl flex justify-center items-center shadow-inner">
                <KeyRound size={32} strokeWidth={2.5} />
              </div>
              <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                Reset password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-500 px-4">
                Enter your registered email address and we'll send you an OTP to reset your password.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleForgotEmailSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-gray-400 bg-gray-50"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-200 transition-all disabled:opacity-70"
              >
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {view === 'forgot-reset' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => { setView('forgot-email'); setError(''); }}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="mt-4">
              <div className="mx-auto h-16 w-16 bg-purple-50 text-purple-600 rounded-2xl flex justify-center items-center shadow-inner">
                <Lock size={32} strokeWidth={2.5} />
              </div>
              <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                Enter OTP & New Password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-500 px-4">
                Code sent to <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleResetPasswordSubmit}>
              <input
                type="text"
                required
                className="block w-full text-center tracking-[0.5em] font-mono py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <input
                type="password"
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              {error && (
                <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-200 transition-all disabled:opacity-70"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {view === 'success' && (
          <div className="py-8 text-center animate-in zoom-in-95 duration-500">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h3>
            <p className="text-gray-500">Your password has been changed successfully.</p>
            <p className="text-sm text-gray-400 mt-6 animate-pulse">Redirecting to login...</p>
          </div>
        )}

      </div>
    </div>
  );
}
