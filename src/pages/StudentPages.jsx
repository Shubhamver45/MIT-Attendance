import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CalendarIcon, MapPinIcon, QrCodeIcon, CalendarDaysIcon, ArrowLeftIcon, UserIcon, MailIcon, ActivityIcon, CheckIcon, XIcon, BookOpenIcon, ShieldIcon } from '../components/Icons.jsx';
import { getCurrentLocation, formatDistance, calculateDistance } from '../utils/geolocation.js';

const API_URL = "https://attendence-backend-tfw2.onrender.com/api";

const StatCard = ({ title, value, subtitle, color, icon }) => {
    const colorClasses = { 
        purple: 'text-[#4B1D6F] bg-[#f5f0ff] border-[#4B1D6F]/10', 
        orange: 'text-[#F39200] bg-[#fff7ed] border-[#F39200]/10', 
        green: 'text-green-600 bg-green-50 border-green-100' 
    };
    return (
        <div className={`dashboard-card border-2 ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[2px] opacity-60">{title}</h3>
                <div className="opacity-40">{icon}</div>
            </div>
            <p className="text-4xl font-black mb-1">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{subtitle}</p>
        </div>
    );
};

export const StudentDashboard = ({ user, token, lectures, attendanceRecords, lectureNotification, onAttendNow, setView }) => {
    const myRecords = attendanceRecords;
    const presentCount = myRecords.filter(rec => rec.status === 'present' || rec.status === 'excused').length;
    const [leaves, setLeaves] = useState([]);

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({ start_date: '', end_date: '', reason: '' });
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

    useEffect(() => {
        const fetchLeaves = async () => {
            if (!user?.id || !token) return;
            try {
                const res = await fetch(`${API_URL}/student/leaves/${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) setLeaves(await res.json());
            } catch (error) { console.error(error); }
        };
        fetchLeaves();
    }, [user, token]);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingLeave(true);
        try {
            const res = await fetch(`${API_URL}/student/leaves`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...leaveForm, studentId: user.id })
            });
            if (res.ok) {
                alert('Leave request submitted!');
                setShowLeaveModal(false);
                setLeaveForm({ start_date: '', end_date: '', reason: '' });
                setLeaves([{...leaveForm, id: Date.now(), status: 'pending', created_at: new Date().toISOString()}, ...leaves]);
            }
        } catch (error) { console.error(error); }
        finally { setIsSubmittingLeave(false); }
    };

    let currentStreak = 0;
    const pastLectures = lectures.filter(l => new Date(`${l.date}T${l.time}`) <= new Date()).sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
    for (const lecture of pastLectures) {
        if (myRecords.some(r => r.lecture_id === lecture.id)) currentStreak++;
        else break;
    }

    const lectureMap = new Map(lectures.map(l => [l.id, l.name]));
    const attendanceRate = lectures.length > 0 ? Math.round((presentCount / lectures.length) * 100) : 0;

    return (
        <div className="portal-container animate-floatUp pb-12">
            <header className="section-header">
                <div>
                    <h2 className="section-title-alt text-[#F39200]">Student</h2>
                    <p className="text-slate-500 font-medium mt-1">Identity: <span className="text-[#4B1D6F] font-black uppercase">{user.name}</span> <span className="mx-2 text-slate-300">|</span> Roll: <span className="font-bold">{user.roll_number || '---'}</span></p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setView('viewSchedule')} className="btn-mit btn-mit-outline border-slate-200 text-slate-600 hover:bg-slate-50">
                        <CalendarIcon className="w-5 h-5" />
                        <span>Timetable</span>
                    </button>
                    <button onClick={() => setView('scanQRCode')} className="btn-mit btn-mit-orange shadow-xl shadow-orange-900/10">
                        <QrCodeIcon className="w-5 h-5" />
                        <span>Mark Attendance</span>
                    </button>
                </div>
            </header>

            {lectureNotification && (
                <div className="mb-8 bg-gradient-to-r from-[#4B1D6F] to-[#3a1656] p-8 rounded-[32px] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 animate-floatUp">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-[#F39200] animate-pulse">
                            <QrCodeIcon className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Attendance Session Active</h3>
                            <p className="text-blue-200 font-bold uppercase tracking-widest text-xs mt-1">Lecture: {lectureNotification.name}</p>
                        </div>
                    </div>
                    <button onClick={() => onAttendNow(lectureNotification)} className="btn-mit btn-mit-orange py-4 px-10 text-sm">
                        Mark Attendance Now
                    </button>
                </div>
            )}

            <div className="bg-[#4B1D6F] p-8 rounded-[40px] mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#4B1D6F]/20">
                <div className="flex items-center gap-8">
                    <div className="text-6xl animate-bounce">🔥</div>
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{currentStreak} Session Streak</h2>
                        <p className="text-purple-200 font-bold uppercase tracking-[4px] text-[10px] mt-1">Keep it up!</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {attendanceRate >= 85 && <span className="bg-white/10 text-white border border-white/20 px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest backdrop-blur-md">🏆 Excellent Attendance</span>}
                    {currentStreak >= 5 && <span className="bg-[#F39200] text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">🔥 Commended</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard title="Attendance Rate" value={`${attendanceRate}%`} subtitle="Minimum 75% Required" color="purple" icon={<ActivityIcon className="w-8 h-8" />} />
                <StatCard title="Classes Attended" value={presentCount} subtitle="Attendance Logs" color="green" icon={<CheckIcon className="w-8 h-8" />} />
                <StatCard title="Missed Classes" value={lectures.length - presentCount} subtitle="Missed Records" color="orange" icon={<XIcon className="w-8 h-8" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="dashboard-card">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">My Attendance</h3>
                        <button onClick={() => setView('viewSchedule')} className="text-[#4B1D6F] font-black text-[10px] uppercase tracking-widest hover:underline">Full Logs</button>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {myRecords.length > 0 ? myRecords.map(record => (
                            <div key={record.id} className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-[#4B1D6F]/30 transition-all">
                                <div>
                                    <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{lectureMap.get(record.lecture_id) || 'Unknown Lecture'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(record.timestamp).toLocaleString()}</p>
                                </div>
                                <span className="bg-green-100 text-green-700 font-black text-[10px] px-4 py-1.5 rounded-xl uppercase tracking-widest">VERIFIED</span>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Records Yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Leave Requests</h3>
                        <button onClick={() => setShowLeaveModal(true)} className="btn-mit btn-mit-purple py-2 px-6 text-[10px]">
                            Apply for Leave
                        </button>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {leaves.length > 0 ? leaves.map(leave => (
                            <div key={leave.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{new Date(leave.start_date).toLocaleDateString()} — {new Date(leave.end_date).toLocaleDateString()}</p>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                                        leave.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                        leave.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                        {leave.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium italic">"{leave.reason}"</p>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                <MailIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Leave Requests Filed</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showLeaveModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#4B1D6F]/40 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-floatUp">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Leave Request</h2>
                                <p className="text-xs text-[#F39200] font-bold uppercase tracking-widest mt-1">Official academic absence request</p>
                            </div>
                            <button onClick={() => setShowLeaveModal(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                                <XIcon className="w-7 h-7" />
                            </button>
                        </div>
                        <form onSubmit={handleLeaveSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Start Date</label>
                                    <input type="date" required value={leaveForm.start_date} onChange={e => setLeaveForm({...leaveForm, start_date: e.target.value})} className="input-field-professional py-3 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">End Date</label>
                                    <input type="date" required value={leaveForm.end_date} onChange={e => setLeaveForm({...leaveForm, end_date: e.target.value})} className="input-field-professional py-3 text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Reason for Leave</label>
                                <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="input-field-professional py-4 text-sm font-medium min-h-[120px]" placeholder="State your reason for academic absence..."></textarea>
                            </div>
                            <button type="submit" disabled={isSubmittingLeave} className="btn-mit btn-mit-purple w-full py-5 text-sm shadow-2xl shadow-[#4B1D6F]/20">
                                {isSubmittingLeave ? 'Submitting...' : 'Submit Leave Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ScanQRCodePage = ({ setView, markAttendance, lectures }) => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);

    const markPresence = async (lectureId) => {
        try {
            setScanResult('Synchronizing Attendance...');
            const success = await markAttendance(lectureId);
            if (success) {
                setScanResult('✓ Attendance Synchronized Successfully!');
                setTimeout(() => setView('studentHome'), 2000);
            } else {
                setScanResult('❌ Synchronization Failure.');
                setTimeout(() => setView('studentHome'), 3000);
            }
        } catch (error) {
            setScanResult(`❌ ${error.message}`);
            setTimeout(() => setView('studentHome'), 3000);
        }
    };

    useEffect(() => {
        if (!isScanning) return;
        const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 15 });
        scanner.render(async (decodedText) => {
            if (!isScanning) return;
            setIsScanning(false);
            try {
                const url = new URL(decodedText);
                const lectureId = url.searchParams.get('lectureId');
                if (lectureId) {
                    setScanResult(`Checking your location......`);
                    try {
                        let lecture = lectures.find(l => l.id === parseInt(lectureId));
                        const studentLocation = await getCurrentLocation();
                        const distance = calculateDistance(studentLocation.latitude, studentLocation.longitude, lecture.latitude, lecture.longitude);
                        const accuracy = studentLocation.accuracy || 0;
                        if (distance - Math.min(accuracy, 200) <= (lecture.radius || 100)) {
                            markPresence(lectureId);
                        } else {
                            setScanResult(`❌ You are outside the classroom zone\n\nYou are ${formatDistance(distance)} from session location.`);
                            setTimeout(() => setView('studentHome'), 4000);
                        }
                    } catch (err) {
                        setScanResult(`❌ Location Error\n\n${err.message}`);
                        setTimeout(() => setView('studentHome'), 3000);
                    }
                }
            } catch { setScanResult('Invalid QR Code.'); setTimeout(() => setView('studentHome'), 2000); }
        }, () => {});
        return () => { if (scanner.getState() === 2) scanner.clear(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScanning, setView, markAttendance, lectures, markPresence]);

    return (
        <div className="portal-container animate-floatUp flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-xl dashboard-card p-12 text-center border-2 border-[#F39200]/20 shadow-2xl">
                <div className="w-20 h-20 bg-orange-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-[#F39200]">
                    <QrCodeIcon className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-4">Scan QR Code</h2>
                
                {scanResult ? (
                    <div className="my-10 min-h-[100px] flex flex-col items-center justify-center">
                        <p className={`text-xl font-black uppercase tracking-tight mb-4 whitespace-pre-line ${scanResult.includes('✓') ? 'text-green-600' : scanResult.includes('❌') ? 'text-red-500' : 'text-[#4B1D6F]'}`}>{scanResult}</p>
                    </div>
                ) : <div id="reader" className="w-full overflow-hidden rounded-[32px] border-4 border-slate-100 mb-10 shadow-inner"></div>}
                
                <button onClick={() => setView('studentHome')} className="flex items-center gap-2 text-slate-400 hover:text-[#4B1D6F] font-black text-[10px] uppercase tracking-widest mx-auto transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" /> Go Back
                </button>
            </div>
        </div>
    );
};

export const ViewSchedulePage = ({ lectures, setView }) => (
    <div className="portal-container animate-floatUp pb-20">
        <header className="section-header">
            <div>
                <button onClick={() => setView('studentHome')} className="flex items-center gap-2 text-slate-400 hover:text-[#4B1D6F] font-black text-[10px] uppercase tracking-widest mb-4 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" /> Dashboard
                </button>
                <h2 className="section-title-alt">Academic Timetable</h2>
                <p className="text-slate-500 font-medium mt-1">Institutional weekly session schedule</p>
            </div>
        </header>
        <div className="max-w-5xl mx-auto space-y-6">
            {lectures.length > 0 ? lectures.map(lecture => (
                <div key={lecture.id} className="dashboard-card border-l-8 border-l-[#4B1D6F] hover:border-l-[#F39200] transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{lecture.name}</h3>
                            <p className="text-xs text-[#F39200] font-bold uppercase tracking-widest mt-1">{lecture.subject}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                            <CalendarDaysIcon className="w-5 h-5 text-[#4B1D6F]" />
                            <p className="text-sm font-black text-slate-600 uppercase tracking-widest">{lecture.time}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#f5f0ff] flex items-center justify-center text-[#4B1D6F]">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lecture.teacher_name}</p>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <CalendarDaysIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Sessions Mapped</h3>
                </div>
            )}
        </div>
    </div>
);

export const StudentProfilePage = ({ setView, user, token }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ subject_teacher_email: '', parents_email: '', mentor_email: '' });
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/student/profile/${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData({ subject_teacher_email: data.subject_teacher_email || '', parents_email: data.parents_email || '', mentor_email: data.mentor_email || '' });
                }
            } catch (error) { console.error(error); }
        };
        fetchProfile();
    }, [user.id, token]);

    const handleSave = async (e) => {
        e.preventDefault();
        setStatusMessage('Submitting...');
        try {
            const res = await fetch(`${API_URL}/student/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatusMessage('Profile Updated!');
                setIsEditing(false);
                setProfile({ ...profile, ...formData });
            }
        } catch { setStatusMessage('Error: Save Failed'); }
        setTimeout(() => setStatusMessage(''), 3000);
    };

    if (!profile) return <div className="portal-container animate-floatUp py-20 text-center"><p className="font-black text-slate-300 uppercase tracking-widest">Loading Profile......</p></div>;

    return (
        <div className="portal-container animate-floatUp pb-20">
            <header className="section-header">
                <div>
                    <button onClick={() => setView('studentHome')} className="flex items-center gap-2 text-slate-400 hover:text-[#4B1D6F] font-black text-[10px] uppercase tracking-widest mb-4 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h2 className="section-title-alt">My Profile</h2>
                    <p className="text-slate-500 font-medium mt-1">Student identification and academic contacts</p>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn-mit btn-mit-purple px-8 py-3 text-[10px]">
                        Edit Profile
                    </button>
                )}
            </header>

            <div className="max-w-4xl mx-auto space-y-10">
                {statusMessage && <div className={`p-4 rounded-2xl text-center font-black text-[10px] uppercase tracking-[4px] shadow-lg animate-fadeIn ${statusMessage.includes('SUCCESS') ? 'bg-green-500 text-white' : 'bg-[#4B1D6F] text-white'}`}>{statusMessage}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="dashboard-card bg-[#4B1D6F] text-white">
                        <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-2">Student Details</p>
                        <h3 className="text-3xl font-black uppercase tracking-tight mb-8">{profile.name}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Student ID</span>
                                <span className="text-sm font-black tracking-widest">{profile.id}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Roll Number</span>
                                <span className="text-sm font-black tracking-widest">{profile.roll_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Enrollment</span>
                                <span className="text-sm font-black tracking-widest">{profile.enrollment_number}</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card border-2 border-slate-100 flex flex-col justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-[#4B1D6F]">
                            <MailIcon className="w-10 h-10" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                        <p className="text-lg font-black text-slate-700 tracking-tight">{profile.email}</p>
                    </div>
                </div>

                <div className="dashboard-card p-10">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-10 pb-6 border-b border-slate-100">Academic Contacts</h3>
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-8">
                            <InputField id="subject_teacher_email" label="Class Teacher Email" type="email" value={formData.subject_teacher_email} onChange={e => setFormData({...formData, subject_teacher_email: e.target.value})} icon={<MailIcon className="w-5 h-5" />} />
                            <div className="grid md:grid-cols-2 gap-8">
                                <InputField id="parents_email" label="Parent Email" type="email" value={formData.parents_email} onChange={e => setFormData({...formData, parents_email: e.target.value})} icon={<MailIcon className="w-5 h-5" />} />
                                <InputField id="mentor_email" label="Mentor Email" type="email" value={formData.mentor_email} onChange={e => setFormData({...formData, mentor_email: e.target.value})} icon={<MailIcon className="w-5 h-5" />} />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="submit" className="btn-mit btn-mit-purple flex-1 py-4 text-[10px]">Save Changes</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-mit btn-mit-outline flex-1 py-4 text-[10px]">CANCEL</button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Class Teacher', value: profile.subject_teacher_email, icon: <UserIcon className="w-5 h-5" /> },
                                { label: 'Guardian', value: profile.parents_email, icon: <ShieldIcon className="w-5 h-5" /> },
                                { label: 'Mentor Email', value: profile.mentor_email, icon: <BookOpenIcon className="w-5 h-5" /> }
                            ].map((node, i) => (
                                <div key={i} className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                                    <div className="text-[#4B1D6F] mb-3">{node.icon}</div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{node.label}</p>
                                    <p className={`text-xs font-bold truncate ${node.value ? 'text-slate-800' : 'text-red-500 italic'}`}>{node.value || 'UNSET'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};