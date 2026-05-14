import React from 'react';
import { UserIcon, GraduationCapIcon, ShieldIcon, ArrowRightIcon } from '../components/Icons.jsx';

export const LandingPage = ({ setView }) => {
    return (
        <div className="w-full min-h-screen" style={{background: 'var(--bg)'}}>

            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="hero-building">
                <div className="hero-content animate-floatUp" style={{maxWidth: '820px', width: '100%'}}>
                    <span className="hero-tagline">MIT Art, Design &amp; Technology University, Pune</span>

                    <h1 className="hero-main-title">
                        A Leap Towards<br />
                        <em style={{fontStyle:'italic', color:'var(--o)'}}>World Class</em> Education
                    </h1>

                    <p className="hero-description">
                        A smart attendance management system for MIT Art, Design &amp; Technology University.
                        Mark attendance via QR codes, track records, manage leaves, and view analytics — all in one place.
                    </p>

                    {/* Stats row */}
                    <div className="flex justify-center gap-10 mb-10 flex-wrap">
                        {[['QR Code', 'Attendance'], ['GPS', 'Location Verified'], ['Leave', 'Management'], ['Instant', 'Reports']].map(([v, l]) => (
                            <div key={l} className="text-center">
                                <p className="font-black text-2xl" style={{color:'var(--p)'}}>{v}</p>
                                <p className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--muted)'}}>{l}</p>
                            </div>
                        ))}
                    </div>

                    <div className="hero-buttons">
                        <button onClick={() => setView('studentLogin')} className="btn-mit btn-mit-purple">
                            Get Started <ArrowRightIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => window.open('https://mituniversity.ac.in/', '_blank')} className="btn-mit btn-mit-outline">
                            University Website
                        </button>
                    </div>
                </div>
            </section>

            {/* ── PORTAL CARDS ─────────────────────────────────── */}
            <section className="portal-section">
                <div className="text-center mb-16">
                    <span className="hero-tagline">Choose Your Portal</span>
                    <h2 style={{fontFamily:"'Playfair Display', serif", fontSize:'2.5rem', fontWeight:900, color:'var(--p)', marginBottom:'1rem'}}>
                        Access Your Dashboard
                    </h2>
                    <p style={{color:'var(--muted)', maxWidth:'480px', margin:'0 auto', fontSize:'1rem', lineHeight:1.7}}>
                        Secure, role-based portals designed for every member of the MIT-ADT academic community.
                    </p>
                </div>

                <div className="portal-grid">
                    {/* Faculty */}
                    <div className="portal-card animate-floatUp" style={{animationDelay:'0.1s'}}>
                        <div className="icon-box"><UserIcon className="w-12 h-12" /></div>
                        <h3>Faculty Portal</h3>
                        <p>Create and manage lectures, generate QR codes for attendance, view student attendance records, and download reports.</p>
                        <button onClick={() => setView('teacherLogin')} className="btn-portal btn-purple">Faculty Login</button>
                    </div>

                    {/* Student */}
                    <div className="portal-card student animate-floatUp" style={{animationDelay:'0.2s'}}>
                        <div className="icon-box"><GraduationCapIcon className="w-12 h-12" /></div>
                        <h3>Student Nexus</h3>
                        <p>Scan QR codes to mark attendance, view your attendance percentage, apply for leave, and check your class schedule.</p>
                        <button onClick={() => setView('studentLogin')} className="btn-portal btn-orange">Student Login</button>
                    </div>

                    {/* Admin */}
                    <div className="portal-card animate-floatUp" style={{animationDelay:'0.3s'}}>
                        <div className="icon-box"><ShieldIcon className="w-12 h-12" /></div>
                        <h3>Admin Panel</h3>
                        <p>Manage students and teachers, view all lectures and attendance records, monitor analytics, and handle leave requests.</p>
                        <button onClick={() => setView('adminLogin')} className="btn-portal btn-purple">Admin Login</button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────── */}
            <footer className="footer">
                <div className="footer-container">
                    <div>
                        <img src="https://mituniversity.ac.in/assets_web/images/LOGO2.png" alt="MIT-ADT" className="footer-logo" />
                        <p style={{fontSize:'0.85rem', lineHeight:1.8, maxWidth:'280px'}}>
                            MIT Art, Design and Technology University has been established under the MIT Art, Design and Technology University Act, 2015.
                        </p>
                    </div>
                    <div>
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="https://mituniversity.ac.in" target="_blank" rel="noreferrer">University Home</a></li>
                            <li><a href="#">Admission 2026</a></li>
                            <li><a href="#">Research &amp; Innovation</a></li>
                            <li><a href="#">Examination Cell</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-title">Portals</h4>
                        <ul className="footer-links">
                            <li><a href="#" onClick={() => setView('teacherLogin')}>Faculty ERP</a></li>
                            <li><a href="#" onClick={() => setView('studentLogin')}>Student Portal</a></li>
                            <li><a href="#" onClick={() => setView('adminLogin')}>Admin Control</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-title">Campus Contact</h4>
                        <p style={{fontSize:'0.85rem', marginBottom:'1rem', lineHeight:1.8}}>
                            Vishwarajbaug, Loni Kalbhor,<br />
                            Pune – 412201, Maharashtra, India.
                        </p>
                        <p className="footer-contact">+91 20 26910227</p>
                        <p className="footer-contact" style={{marginTop:'0.5rem'}}>info@mituniversity.edu.in</p>
                    </div>
                </div>
                <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', padding:'2rem', textAlign:'center'}}>
                    <p style={{fontSize:'0.75rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:700}}>
                        © 2025 MIT Art, Design and Technology University. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};