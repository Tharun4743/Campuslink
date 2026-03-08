import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function TeacherSignup() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    department: '',
    subjects_teaching: '',
    years_of_experience: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email first to receive OTP.');
      return;
    }
    setError('');
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (res.ok) {
        setOtpSent(true);
        setError('OTP sent to your email.');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send OTP.');
      }
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setError('Please request an OTP first.');
      return;
    }
    setError('');

    try {
      const res = await fetch('/api/signup/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          years_of_experience: parseInt(formData.years_of_experience, 10)
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <div className="mx-auto h-12 w-12 text-indigo-600 flex justify-center items-center">
            <BookOpen size={48} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Teacher Signup
          </h2>
        </div>

        {isSuccess ? (
          <div className="mt-8 text-center p-6 bg-green-50 rounded-lg border border-green-200 shadow-sm animate-pulse">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">OTP Verified Successfully!</h3>
            <p className="text-green-600 font-medium">Your account has been created.</p>
            <p className="text-sm text-green-500 mt-2">Redirecting you to the login page...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-3">
              <input
                name="full_name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <input
                name="department"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Department (e.g., Computer Science)"
                value={formData.department}
                onChange={handleChange}
              />
              <input
                name="subjects_teaching"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Subjects Teaching (e.g., Mathematics)"
                value={formData.subjects_teaching}
                onChange={handleChange}
              />
              <input
                name="years_of_experience"
                type="number"
                required
                min="0"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Years of Experience"
                value={formData.years_of_experience}
                onChange={handleChange}
              />
              {otpSent && (
                <input
                  name="otp"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-digit OTP from email"
                  value={formData.otp}
                  onChange={handleChange}
                />
              )}
            </div>

            {error && <div className={`text-sm text-center ${error.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>{error}</div>}

            <div>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Confirm Registration
                </button>
              )}
            </div>
            <div className="text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
            </div>
          </form>
        )}
      </div >
    </div >
  );
}
