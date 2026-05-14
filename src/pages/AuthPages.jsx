import React, { useState } from 'react';
import { InputField } from '../components/InputField.jsx';
import {
    ArrowLeftIcon,
    UserIcon,
    MailIcon,
    LockIcon,
    BookOpenIcon,
    GraduationCapIcon,
    ShieldIcon
} from '../components/Icons.jsx';
import { FaceCapture } from '../components/FaceCapture.jsx';

const AuthFormContainer = ({ children, title, subtitle, icon }) => (
    <div className="auth-card animate-floatUp">
        <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-3xl text-[#4B1D6F] shadow-inner mb-2">{icon}</div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{title}</h1>
            {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
        </div>
        {children}
    </div>
);

const AuthPageWrapper = ({ children }) => (
    <div className="auth-bg">
        <main className="w-full flex justify-center">{children}</main>
    </div>
);

export const TeacherLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        await onLogin(email, password, 'teacher');
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper>
            <AuthFormContainer icon={<UserIcon className="w-10 h-10" />} title="Faculty Login" subtitle="Access your academic workspace">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField autoFocus label="Faculty Email" type="email" id="email" placeholder="Enter your Email Address" icon={<MailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Secure Password" type="password" id="password" placeholder="Enter your password" icon={<LockIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={isSubmitting} className="btn-mit btn-mit-purple w-full py-4 text-sm font-bold">
                        {isSubmitting ? 'Authenticating...' : 'Secure Sign In'}
                    </button>
                </form>
                <div className="text-center mt-8">
                    <p className="text-slate-500 text-sm">New to the faculty? <a href="#" onClick={(e) => { e.preventDefault(); setView('teacherRegister') }} className="font-bold text-[#F39200] hover:underline uppercase tracking-wider ml-1">Create Account</a></p>
                    <button onClick={() => setView('landing')} className="mt-6 text-slate-400 hover:text-[#4B1D6F] transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to Home
                    </button>
                </div>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const TeacherRegisterPage = ({ setView, onRegister }) => {
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'teacher' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onRegister(formData);
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper>
            <AuthFormContainer icon={<UserIcon className="w-10 h-10" />} title="Faculty Registration" subtitle="Register for the digital ecosystem">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputField id="name" label="Full Name" type="text" placeholder="Enter your full name" icon={<UserIcon className="w-5 h-5" />} value={formData.name} onChange={handleChange} />
                    <InputField id="email" label="Email Address" type="email" placeholder="Enter your email" icon={<MailIcon className="w-5 h-5" />} value={formData.email} onChange={handleChange} />
                    <InputField id="password" label="Create Password" type="password" placeholder="Create a secure password" icon={<LockIcon className="w-5 h-5" />} value={formData.password} onChange={handleChange} />
                    <InputField id="id" label="Employee ID" type="text" placeholder="e.g., mit1234" icon={<UserIcon className="w-5 h-5" />} value={formData.id} onChange={handleChange} />
                    <button type="submit" disabled={isSubmitting} className="btn-mit btn-mit-purple w-full py-4 text-sm font-bold mt-4">
                        {isSubmitting ? 'Processing...' : 'Register as Faculty'}
                    </button>
                </form>
                <div className="text-center mt-8">
                    <p className="text-slate-500 text-sm">Already registered? <a href="#" onClick={(e) => { e.preventDefault(); setView('teacherLogin') }} className="font-bold text-[#F39200] hover:underline uppercase tracking-wider ml-1">Sign in here</a></p>
                </div>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const StudentLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        await onLogin(email, password, 'student');
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper>
            <AuthFormContainer icon={<GraduationCapIcon className="w-10 h-10" />} title="Student Login" subtitle="Enter the Student">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField autoFocus label="Student Email" type="email" id="email" placeholder="Enter your student email" icon={<MailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Secure Password" type="password" id="password" placeholder="Enter your password" icon={<LockIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={isSubmitting} className="btn-mit btn-mit-orange w-full py-4 text-sm font-bold">
                        {isSubmitting ? 'Verifying...' : 'Access Nexus'}
                    </button>
                </form>
                <div className="text-center mt-8">
                    <p className="text-slate-500 text-sm">Need portal access? <a href="#" onClick={(e) => { e.preventDefault(); setView('studentRegister') }} className="font-bold text-[#4B1D6F] hover:underline uppercase tracking-wider ml-1">Join Nexus</a></p>
                    <button onClick={() => setView('landing')} className="mt-6 text-slate-400 hover:text-[#4B1D6F] transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to Home
                    </button>
                </div>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const StudentRegisterPage = ({ setView, onRegister }) => {
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'student', roll_number: '', enrollment_number: '', subject_teacher_email: '', parents_email: '', mentor_email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onRegister(formData);
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper>
            <AuthFormContainer icon={<GraduationCapIcon className="w-10 h-10" />} title="Student Enrollment" subtitle="Register your academic profile">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField id="name" label="Full Name" type="text" placeholder="Full name" icon={<UserIcon className="w-5 h-5" />} value={formData.name} onChange={handleChange} />
                        <InputField id="roll_number" label="Roll Number" type="text" placeholder="Roll number" icon={<UserIcon className="w-5 h-5" />} value={formData.roll_number} onChange={handleChange} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField id="enrollment_number" label="Enrollment No" type="text" placeholder="Enrollment no" icon={<UserIcon className="w-5 h-5" />} value={formData.enrollment_number} onChange={handleChange} />
                        <InputField id="id" label="Student ID" type="text" placeholder="e.g., mit263" icon={<UserIcon className="w-5 h-5" />} value={formData.id} onChange={handleChange} />
                    </div>
                    <InputField id="email" label="Student Email" type="email" placeholder="Email Address" icon={<MailIcon className="w-5 h-5" />} value={formData.email} onChange={handleChange} />
                    <InputField id="password" label="Create Password" type="password" placeholder="Create a secure password" icon={<LockIcon className="w-5 h-5" />} value={formData.password} onChange={handleChange} />
                    
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Face Registration (Required)</p>
                        <FaceCapture 
                            onCapture={(embedding) => setFormData(prev => ({ ...prev, face_embedding: embedding }))} 
                            buttonText="Register Face"
                        />
                        {formData.face_embedding && (
                            <p className="text-[10px] text-green-600 font-black mt-3 text-center uppercase tracking-widest">✓ Face Registered</p>
                        )}
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Academic Contacts</p>
                        <InputField id="subject_teacher_email" label="Class Teacher Email" type="email" placeholder="Teacher's email" icon={<MailIcon className="w-5 h-5 text-slate-400" />} value={formData.subject_teacher_email} onChange={handleChange} />
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField id="parents_email" label="Parents Email" type="email" placeholder="Parents email" icon={<MailIcon className="w-5 h-5 text-slate-400" />} value={formData.parents_email} onChange={handleChange} />
                            <InputField id="mentor_email" label="Mentor Email" type="email" placeholder="Mentor email" icon={<MailIcon className="w-5 h-5 text-slate-400" />} value={formData.mentor_email} onChange={handleChange} />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !formData.face_embedding} 
                        className="btn-mit btn-mit-orange w-full py-4 text-sm font-bold mt-6"
                    >
                        {isSubmitting ? 'Registering Profile...' : 'Create Account'}
                    </button>
                </form>
                <div className="text-center mt-8">
                    <p className="text-slate-500 text-sm">Already a member? <a href="#" onClick={(e) => { e.preventDefault(); setView('studentLogin') }} className="font-bold text-[#4B1D6F] hover:underline uppercase tracking-wider ml-1">Sign in here</a></p>
                </div>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};

export const AdminLoginPage = ({ setView, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        await onLogin(email, password, 'admin');
        setIsSubmitting(false);
    };

    return (
        <AuthPageWrapper>
            <AuthFormContainer icon={<ShieldIcon className="w-10 h-10" />} title="Admin Portal" subtitle="Institutional Command Access">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField autoFocus label="Admin Credentials" type="email" id="admin-email" placeholder="Enter admin email" icon={<MailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Secure Access Key" type="password" id="admin-password" placeholder="Enter security key" icon={<LockIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={isSubmitting} className="btn-mit btn-mit-purple w-full py-4 text-sm font-bold">
                        {isSubmitting ? 'Verifying ROLE...' : 'Grant Access'}
                    </button>
                </form>
                <p className="text-center text-slate-400 mt-8 text-xs font-medium max-w-[280px] mx-auto uppercase tracking-widest leading-relaxed">Admin access is restricted to authorized university personnel only.</p>
                <button onClick={() => setView('landing')} className="mt-8 text-slate-400 hover:text-[#4B1D6F] transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Home
                </button>
            </AuthFormContainer>
        </AuthPageWrapper>
    );
};