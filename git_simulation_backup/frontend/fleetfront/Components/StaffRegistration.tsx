"use client"
import React, { useState } from 'react'

const StaffRegistration = () => {
    const [adminEmail, setAdminEmail] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('driver');
    const [customRole, setCustomRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg placeholder:text-[#C4BFAF] placeholder:font-light focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none";
    const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        const roleName = role === 'other' ? customRole : role;

        try {
            const res = await fetch('http://localhost:3000/api/staff/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-email': adminEmail
                },
                body: JSON.stringify({
                    email,
                    name,
                    password,
                    roleName
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Staff successfully registered!' });
                setName(''); setEmail(''); setPassword(''); setCustomRole(''); setRole('driver');
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to register staff' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network error occurred' });
        }
    };

    return (
        <div className="w-full max-w-xl bg-transparent md:bg-white/60 md:backdrop-blur-sm p-4 md:p-12 lg:p-16 border-none md:border md:border-[#EBE6DD] shadow-none md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] transition-all duration-500">
            <div className="mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-['Playfair_Display',_serif] tracking-tight text-[#1A1A1A]">
                    Staff Portal
                </h2>
                <p className="mt-4 text-[#8C877D] text-xs md:text-sm font-light tracking-wide px-4 md:px-0">
                    Register new organizational members
                </p>
            </div>

            {status.message && (
                <div className={`mb-8 p-4 text-sm tracking-widest uppercase text-center ${status.type === 'success' ? 'bg-[#F3F4F0] text-[#4A5D23] border border-[#D5E1C8]' : 'bg-[#FDF4F4] text-[#8B3A3A] border border-[#F4DADA]'}`}>
                    {status.message}
                </div>
            )}

            <form className="flex flex-col gap-10 md:gap-8" onSubmit={handleSubmit}>
                <div className="flex flex-col">
                    <label className={labelStyle}>Admin Authorizing Email</label>
                    <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@company.com"
                        className={inputStyle}
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className={labelStyle}>Staff Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={inputStyle} required />
                </div>

                <div className="flex flex-col">
                    <label className={labelStyle}>Staff Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" className={inputStyle} required />
                </div>

                <div className="relative flex flex-col">
                    <label className={labelStyle}>Staff Temporary Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`${inputStyle} pr-16`}
                            required
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

                <div className="relative flex flex-col">
                    <label className={labelStyle}>Assigned Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-transparent border-b border-[#DCD7CB] py-4 md:py-3 text-[#1A1A1A] font-light text-base md:text-lg focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none cursor-pointer rounded-none"
                    >
                        <option value="driver">Driver</option>
                        <option value="conductor">Conductor</option>
                        <option value="other">Other (Custom)</option>
                    </select>
                    <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                </div>

                {role === 'other' && (
                    <div className="flex flex-col animate-in fade-in duration-500">
                        <label className={labelStyle}>Custom Role Name</label>
                        <input
                            type="text"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            placeholder="Mechanic, Technician..."
                            className={inputStyle}
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full mt-6 md:mt-8 bg-[#1A1A1A] text-[#F9F8F4] text-xs font-semibold uppercase tracking-[0.2em] py-5 transition-all duration-300 hover:bg-[#333333] hover:shadow-lg rounded-none"
                >
                    Register Profile
                </button>
            </form>
        </div>
    )
}

export default StaffRegistration
