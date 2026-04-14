"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'

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
        localStorage.setItem('orgId', res.data.organizationId)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4] p-6 md:p-12 text-[#1A1A1A]">
      <div className="w-full max-w-lg bg-transparent md:bg-white/60 md:backdrop-blur-sm p-4 md:p-12 lg:p-16 border-none md:border md:border-[#EBE6DD] shadow-none md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] transition-all duration-500">

        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display',_serif] tracking-tight text-[#1A1A1A]">
            Welcome
          </h2>
          <p className="mt-4 text-[#8C877D] text-xs md:text-sm font-light tracking-wide px-4 md:px-0">
            Please enter your details to access your account.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-[#FDF4F4] text-[#8B3A3A] border border-[#F4DADA] text-[10px] uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-10 md:gap-8" onSubmit={handleLogin}>
          <div className="relative flex flex-col">
            <label htmlFor="Role" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Account Role
            </label>
            <select
              name="Role"
              id="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none cursor-pointer rounded-none"
            >
              <option value="ADMIN">Administrator</option>
              <option value="USER">Standard User</option>
              <option value="DRIVER">Driver</option>
            </select>
            <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">
              ↓
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] placeholder:font-light focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 md:mt-8 bg-[#1A1A1A] text-[#F9F8F4] text-xs font-semibold uppercase tracking-[0.2em] py-5 transition-all duration-300 hover:bg-[#333333] hover:shadow-lg rounded-none flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
          </button>

          <p className="text-center text-[#8C877D] text-[10px] uppercase tracking-widest mt-4">
            Don't have an account? <a href="/Signup" className="text-[#1A1A1A] font-bold underline">Register</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Page