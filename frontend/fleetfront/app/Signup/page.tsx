"use client"
import React, { useState } from 'react'

function Page() {
    const [role, setRole] = useState('admin');
    const [showAdminPassword, setShowAdminPassword] = useState(false);

    // Helper styles for the luxury aesthetic
    const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 pl-2 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] placeholder:font-light focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none";
    const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4] p-6 md:p-12 text-[#1A1A1A]">

            <div className="w-full max-w-xl bg-transparent md:bg-white/60 md:backdrop-blur-sm p-4 md:p-12 lg:p-16 border-none md:border md:border-[#EBE6DD] shadow-none md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] transition-all duration-500">

                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-['Playfair_Display',_serif] tracking-tight text-[#1A1A1A]">
                        Registration
                    </h2>
                    <p className="mt-4 text-[#8C877D] text-xs md:text-sm font-light tracking-wide px-4 md:px-0">
                        Select your account type to proceed with enrollment.
                    </p>
                </div>

                <form className="flex flex-col gap-10 md:gap-8" onSubmit={(e) => e.preventDefault()}>

                    {/* Role Selection */}
                    <div className="relative flex flex-col">
                        <label htmlFor="Role" className={labelStyle}>Account Role</label>
                        <select
                            name="Role"
                            id="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none cursor-pointer rounded-none"
                        >
                            <option value="admin">Administrator</option>
                            <option value="user">Standard User</option>
                        </select>
                        <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                    </div>

                    {/* =========================================
              ADMINISTRATOR FIELDS
              ========================================= */}
                    {role === 'admin' && (
                        <div className="flex flex-col gap-10 md:gap-8 animate-in fade-in duration-500">
                            <div className="flex flex-col">
                                <label className={labelStyle}>Full Name</label>
                                <input type="text" placeholder="Jane Doe" className={inputStyle} />
                            </div>

                            <div className="flex flex-col">
                                <label className={labelStyle}>Business Name</label>
                                <input type="text" placeholder="Apex Logistics" className={inputStyle} />
                            </div>

                            <div className="relative flex flex-col">
                                <label className={labelStyle}>Business Type</label>
                                <select className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none cursor-pointer rounded-none">
                                    <option value="bus">Bus Operator</option>
                                    <option value="truck">Truck Operator</option>
                                    <option value="both">Both</option>
                                </select>
                                <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                            </div>

                            <div className="flex flex-col">
                                <label className={labelStyle}>Registered Address</label>
                                <input type="text" placeholder="123 Commerce Blvd" className={inputStyle} />
                            </div>

                            <div className="relative flex flex-col">
                                <label className={labelStyle}>Admin Password</label>
                                <div className="relative">
                                    <input
                                        type={showAdminPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`${inputStyle} pr-16`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                                        className="absolute right-0 bottom-4 md:bottom-3 text-[10px] uppercase tracking-wider font-semibold text-[#8C877D] hover:text-[#1A1A1A] transition-colors"
                                    >
                                        {showAdminPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =========================================
              STANDARD USER FIELDS
              ========================================= */}
                    {role === 'user' && (
                        <div className="flex flex-col gap-10 md:gap-8 animate-in fade-in duration-500">
                            <div className="flex flex-col">
                                <label className={labelStyle}>Full Name</label>
                                <input type="text" placeholder="Raja Smith" className={inputStyle} />
                            </div>

                            <div className="flex flex-col">
                                <label className={labelStyle}>Mobile Number</label>
                                <input type="tel" placeholder="+91 9898123001" className={inputStyle} />
                            </div>

                            <div className="flex flex-col">
                                <label className={labelStyle}>Email Address</label>
                                <input type="email" placeholder="name@example.com" className={inputStyle} />
                            </div>

                            <div className="relative flex flex-col">
                                <label className={labelStyle}>Password</label>
                                <div className="relative">
                                    <input
                                        type={showAdminPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`${inputStyle} pr-16`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                                        className="absolute right-0 bottom-4 md:bottom-3 text-[10px] uppercase tracking-wider font-semibold text-[#8C877D] hover:text-[#1A1A1A] transition-colors"
                                    >
                                        {showAdminPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}




                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full mt-6 md:mt-8 bg-[#1A1A1A] text-[#F9F8F4] text-xs font-semibold uppercase tracking-[0.2em] py-5 transition-all duration-300 hover:bg-[#333333] hover:shadow-lg rounded-none"
                    >
                        Complete Registration
                    </button>

                </form>
            </div>
        </div>
    )
}

export default Page