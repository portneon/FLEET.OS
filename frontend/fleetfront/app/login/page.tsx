"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

function Page() {
  const router = useRouter()
  const [role, setRole] = useState('ADMIN')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await authAPI.login(email, password)

      if (res.error) {
        setError(res.error)
      } else if (res.data) {
        // Store session data
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('orgId', res.data.organizationId)
        localStorage.setItem('user', JSON.stringify(res.data.user))


        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login('admin@lazy.com', 'lazy123');
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('orgId', res.data.organizationId);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Demo access unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] placeholder:font-light focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none";
  const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2 block";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4] p-6 md:p-12 text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#F9F8F4]">


      <div className="w-full max-w-lg bg-transparent md:bg-white/60 md:backdrop-blur-sm p-4 md:p-12 lg:p-16 border-none md:border md:border-[#EBE6DD] shadow-none md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] transition-all duration-500">

        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display',_serif] tracking-tight text-[#1A1A1A]">
            Welcome Back
          </h2>
          <p className="mt-4 text-[#8C877D] text-xs md:text-sm font-light tracking-wide px-4 md:px-0">
            Please enter your details to access your workspace.
          </p>
        </div>

        {/* Minimalist Error State */}
        {error && (
          <div className="mb-8 border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{error}</p>
          </div>
        )}

        <form className="flex flex-col gap-10 md:gap-8" onSubmit={handleLogin}>

          {/* Role Selection */}
          <div className="relative flex flex-col">
            <label htmlFor="Role" className={labelStyle}>
              Account Role
            </label>
            <select
              name="Role"
              id="Role"
              value={role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
              className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none cursor-pointer rounded-none"
            >
              <option value="ADMIN">Administrator</option>
              <option value="USER">Standard User</option>
              <option value="DRIVER">Driver</option>
            </select>

            <div className="absolute right-0 bottom-4 md:bottom-3 pointer-events-none text-[#8C877D]">
              ↓
            </div>
          </div>


          <div className="flex flex-col">
            <label htmlFor="email" className={labelStyle}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className={inputStyle}
              required
            />
          </div>


          <div className="flex flex-col relative">
            <div className="flex justify-between items-end w-full">
              <label htmlFor="password" className={labelStyle}>
                Password
              </label>
              <a href="#" className="text-[9px] uppercase tracking-widest text-[#8C877D] hover:text-[#1A1A1A] transition-colors pb-2">
                Recover?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputStyle}
              required
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#1A1A1A] text-[#F9F8F4] text-xs font-semibold uppercase tracking-[0.2em] py-5 transition-all duration-300 hover:bg-[#333333] hover:shadow-lg rounded-none disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="relative flex items-center gap-4 my-2">
            <div className="flex-1 h-[1px] bg-[#EBE6DD]"></div>
            <span className="text-[9px] uppercase tracking-widest text-[#8C877D] font-bold">OR</span>
            <div className="flex-1 h-[1px] bg-[#EBE6DD]"></div>
          </div>

          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com'}>
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  setError('');
                  try {
                    const res = await authAPI.googleLogin(credentialResponse.credential!);
                    if (res.error) {
                      setError(res.error);
                    } else if (res.data) {
                      localStorage.setItem('token', res.data.token);
                      localStorage.setItem('orgId', res.data.organizationId);
                      localStorage.setItem('user', JSON.stringify(res.data.user));
                      router.push('/dashboard');
                    }
                  } catch (err) {
                    setError('Google Authentication failed.');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError('Google Authentication failed.');
                }}
              />
            </div>
          </GoogleOAuthProvider>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-[#FFFFFF] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.2em] py-5 border border-[#1A1A1A] transition-all duration-300 hover:bg-[#F9F8F4] group flex justify-center items-center gap-3"
          >
            <span className="group-hover:translate-x-1 transition-transform">Explore Lazy Logistics Demo →</span>
          </button>

        </form>

        {/* Footer Text */}
        <div className="mt-12 text-center border-t border-[#EBE6DD] pt-8">
          <p className="text-[10px] uppercase tracking-widest text-[#8C877D]">
            No access?{' '}
            <a href="/Signup" className="font-bold text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#5A5750] hover:border-[#5A5750] transition-colors">
              Request Workspace
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Page