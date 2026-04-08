"use client"
import React from 'react'

function Page() {
  return (
    // Base is mobile, md: is tablet/desktop
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4] p-6 md:p-12 text-[#1A1A1A]">

      {/* Mobile: No background, no border, no shadow (seamless full-screen feel)
        Desktop (md:): Adds the white/60 glass effect, border, and delicate shadow 
      */}
      <div className="w-full max-w-lg bg-transparent md:bg-white/60 md:backdrop-blur-sm p-4 md:p-12 lg:p-16 border-none md:border md:border-[#EBE6DD] shadow-none md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] transition-all duration-500">

        <div className="mb-12 text-center">
          {/* Slightly smaller heading on mobile to keep it on one line if possible */}
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display',_serif] tracking-tight text-[#1A1A1A]">
            Welcome
          </h2>
          <p className="mt-4 text-[#8C877D] text-xs md:text-sm font-light tracking-wide px-4 md:px-0">
            Please enter your details to access your account.
          </p>
        </div>

        {/* Increased gap slightly on mobile for easier tapping */}
        <form className="flex flex-col gap-10 md:gap-8">

          <div className="relative flex flex-col">
            <label htmlFor="Role" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Account Role
            </label>
            <select
              name="Role"
              id="Role"
              // py-4 on mobile for a bigger touch area, py-3 on desktop
              className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none cursor-pointer rounded-none"
            >
              <option value="admin">Administrator</option>
              <option value="user">Standard User</option>
              <option value="driver">Driver</option>
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
              placeholder="name@example.com"
              className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] placeholder:font-light focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 md:mt-8 bg-[#1A1A1A] text-[#F9F8F4] text-xs font-semibold uppercase tracking-[0.2em] py-5 transition-all duration-300 hover:bg-[#333333] hover:shadow-lg rounded-none"
          >
            Login In
          </button>

        </form>
      </div>
    </div>
  )
}

export default Page