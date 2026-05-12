import React from 'react';
import { BookOpenIcon, LogOutIcon, UserIcon } from './Icons.jsx';

export const Navbar = ({ user, setView, onLogout, isDarkMode, setIsDarkMode }) => {
    return (
        <header className="nav-mit sticky top-0 z-[1000]">
            <div className="nav-container">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('landing')}>
                    <img src="https://mituniversity.ac.in/assets_web/images/LOGO2.png" alt="MIT-ADT UNIVERSITY" className="nav-logo" />
                </div>

                <div className="flex items-center gap-6">
                    {!user ? (
                        <nav className="flex items-center gap-6">
                            <button onClick={() => setView('landing')} className="nav-link hidden md:block">Home</button>
                            <button onClick={() => setView('teacherLogin')} className="nav-link hidden md:block">Faculty</button>
                            <button onClick={() => setView('studentLogin')} className="nav-link hidden md:block">Students</button>
                            <button onClick={() => setView('adminLogin')} className="btn-mit btn-mit-orange !py-2.5 !px-8 !min-w-0 !text-[11px]">Admin Login</button>
                        </nav>
                    ) : (
                        <div className="flex items-center gap-4">
                            {setIsDarkMode && (
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center text-lg"
                                    title="Toggle Dark Mode"
                                >
                                    {isDarkMode ? '☀️' : '🌙'}
                                </button>
                            )}
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-2xl border border-white/10">
                                <div className="w-7 h-7 rounded-lg bg-[#F39200] text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-[2px] hidden md:block">{user.name}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="w-11 h-11 rounded-xl bg-white/10 text-white hover:bg-red-500 transition-all border border-white/10 flex items-center justify-center shadow-inner"
                            >
                                <LogOutIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};