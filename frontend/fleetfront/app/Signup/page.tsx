"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'

function Page() {
    const router = useRouter()
    const [role, setRole] = useState('ADMIN')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')


    const [businessName, setBusinessName] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const signupData = {
                name,
                email,
                password,
                businessName,
                role
            }

            if (role === 'ADMIN') {
                signupData.businessName = businessName
            }

            const res = await authAPI.register(signupData)

            if (res.error) {
                setError(res.error)
            } else {
                setSuccess('Registration successful! Redirecting to login...')
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch (err) {
            setError('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

  
    const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] placeholder:font-light focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none";
    const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2 block";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4] p-6 md:p-12 text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#F9F8F4]">

            <div className="w-full max-w-xl bg-transparent md:bg-white/60 md:backdrop-blur-sm p-4 md:p-12 lg:p-16 border-none md:border md:border-[#EBE6DD] shadow-none md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] transition-all duration-500">

                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-['Playfair_Display',_serif] tracking-tight text-[#1A1A1A]">
                        Registration
                    </h2>
                    <p className="mt-4 text-[#8C877D] text-xs md:text-sm font-light tracking-wide px-4 md:px-0">
                        Select your account type to proceed with enrollment.
                    </p>
                </div>

                {/* Restyled Error State */}
                {error && (
                    <div className="mb-8 border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{error}</p>
                    </div>
                )}

                {/* Restyled Success State */}
                {success && (
                    <div className="mb-8 border border-[#14532d]/20 bg-[#f0fdf4] p-4 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-[#14532d] font-semibold">{success}</p>
                    </div>
                )}

                <form className="flex flex-col gap-10 md:gap-8" onSubmit={handleSignup}>

                    <div className="relative flex flex-col">
                        <label htmlFor="Role" className={labelStyle}>Account Role</label>
                        <select
                            name="Role"
                            id="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none cursor-pointer rounded-none"
                        >
                            <option value="ADMIN">Administrator</option>
                            <option value="USER">Standard User</option>
                        </select>
                        <div className="absolute right-0 bottom-4 md:bottom-3 pointer-events-none text-[#8C877D]">↓</div>
                    </div>

                    <div className="flex flex-col gap-10 md:gap-8 animate-in fade-in duration-500">
                        <div className="flex flex-col">
                            <label className={labelStyle}>Full Name</label>
                            <input
                                type="text" required
                                value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe" className={inputStyle}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className={labelStyle}>Email Address</label>
                            <input
                                type="email" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com" className={inputStyle}
                            />
                        </div>

                        {role === 'ADMIN' && (
                            <div className="flex flex-col animate-in slide-in-from-top-2 duration-300">
                                <label className={labelStyle}>Business Name</label>
                                <input
                                    type="text" required
                                    value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Apex Logistics" className={inputStyle}
                                />
                            </div>
                        )}

                        <div className="relative flex flex-col">
                            <label className={labelStyle}>Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`${inputStyle} pr-16`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 bottom-4 md:bottom-3 text-[10px] uppercase tracking-wider font-semibold text-[#8C877D] hover:text-[#1A1A1A] transition-colors"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 md:mt-8 bg-[#1A1A1A] text-[#F9F8F4] text-xs font-semibold uppercase tracking-[0.2em] py-5 transition-all duration-300 hover:bg-[#333333] hover:shadow-lg rounded-none disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                                Processing...
                            </>
                        ) : (
                            'Complete Registration'
                        )}
                    </button>

                    <div className="mt-8 text-center border-t border-[#EBE6DD] pt-8">
                        <p className="text-[10px] uppercase tracking-widest text-[#8C877D]">
                            Already have an account?{' '}
                            <a href="/login" className="font-bold text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#5A5750] hover:border-[#5A5750] transition-colors">
                                Log In
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Page