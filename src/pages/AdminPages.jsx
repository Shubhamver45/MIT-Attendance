import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { 
    BarChartIcon, DownloadIcon, TrashIcon, UsersIcon, ActivityIcon, 
    BookOpenIcon, UserIcon, GraduationCapIcon, ShieldIcon, XIcon, 
    CalendarIcon, LockIcon, PlusIcon, EditIcon, ArrowLeftIcon 
} from '../components/Icons.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

const API_URL = import.meta.env.VITE_API_URL || "https://attendence-backend-tfw2.onrender.com/api";

const HeaderStats = ({ label, value, icon, loading }) => (
    <div className="dashboard-card group transition-all hover:scale-[1.02]">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 tracking-[2px] uppercase mb-2">{label}</p>
                {loading ? (
                    <div className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse"></div>
                ) : (
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
                )}
            </div>
            <div className={`p-4 rounded-2xl bg-[#f5f0ff] text-[#4B1D6F] group-hover:bg-[#4B1D6F] group-hover:text-white transition-all duration-500`}>
                {icon}
            </div>
        </div>
    </div>
);

const EmptyState = ({ icon, title, desc }) => (
    <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 animate-fadeIn">
        <div className="inline-block p-6 bg-white rounded-3xl mb-6 shadow-sm">{icon}</div>
        <p className="font-black text-slate-800 text-lg uppercase tracking-widest">{title}</p>
        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto font-medium">{desc}</p>
    </div>
);

const UsersTab = ({ allUsers, onAdd, onEdit, onDelete, onDownload }) => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = useMemo(() => allUsers.filter(u => {
        const q = search.toLowerCase();
        const match = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.roll_number?.toLowerCase().includes(q);
        return match && (roleFilter === 'all' || u.role === roleFilter);
    }), [allUsers, search, roleFilter]);

    return (
        <div className="space-y-8 animate-floatUp">
            <header className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex gap-3">
                    <span className="bg-[#f5f0ff] text-[#4B1D6F] px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-[#4B1D6F]/10">Teachers: {allUsers.filter(u => u.role === 'teacher').length}</span>
                    <span className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-orange-100">Students: {allUsers.filter(u => u.role === 'student').length}</span>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <input type="text" placeholder="Search Directory..." className="input-field-professional py-3 px-6 text-sm !w-auto min-w-[200px]" value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="input-field-professional py-3 px-6 text-sm !w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers Only</option>
                        <option value="student">Students Only</option>
                    </select>
                    <button onClick={onAdd} className="btn-mit btn-mit-outline py-3 px-6 text-[10px]"><PlusIcon className="w-4 h-4" /> ADD USER</button>
                    <button onClick={onDownload} className="btn-mit btn-mit-purple py-3 px-6 text-[10px]"><DownloadIcon className="w-4 h-4" /> Export CSV</button>
                </div>
            </header>

            {filtered.length === 0 ? <EmptyState icon={<UsersIcon className="w-12 h-12 text-slate-200" />} title="No Users Found" desc="Try adjusting your synchronization parameters." /> : (
                <div className="dashboard-card overflow-hidden !p-0 border-slate-100 border">
                    <table className="mit-table">
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>ROLE</th>
                                <th>IDENTIFIER</th>
                                <th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id} className="group hover:bg-slate-50 transition-all">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg transition-transform group-hover:scale-110 ${u.role === 'teacher' ? 'bg-[#4B1D6F]' : 'bg-[#F39200]'}`}>
                                                {u.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 uppercase text-xs tracking-tight">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${u.role === 'teacher' ? 'bg-[#f5f0ff] text-[#4B1D6F] border-[#4B1D6F]/10' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{u.role}</span></td>
                                    <td className="font-mono text-[10px] font-black text-slate-400 tracking-widest">{u.roll_number || u.enrollment_number || '---'}</td>
                                    <td>
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => onEdit(u)} className="p-2 text-slate-400 hover:text-[#4B1D6F] hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"><EditIcon className="w-4 h-4" /></button>
                                            <button onClick={() => onDelete(u.id, u.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const AdminDashboard = ({ user, token, initialTab = 'overview' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [data, setData] = useState({ stats: {}, users: [], lectures: [], attendance: [], trend: [], topStudents: [], subjects: [], leaves: [] });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', mode: '', data: null });
    const [formData, setFormData] = useState({});


    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };

    const loadData = async () => {
        setLoading(true);
        try {
            const endpoints = ['dashboard-stats', 'all-users', 'combined-lectures', 'combined-attendance', 'attendance-trend', 'top-students', 'attendance-by-subject', 'leaves'];
            const res = await Promise.all(endpoints.map(ep => fetch(`${API_URL}/admin/${ep}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null)));
            const [stats, users, lectures, attendance, trend, topStudents, subjects, leaves] = res;
            setData({ stats: stats || {}, users: users || [], lectures: lectures ? [...(lectures.active || []), ...(lectures.archived || [])] : [], attendance: attendance ? [...(attendance.active || []), ...(attendance.archived || [])] : [], trend: trend || [], topStudents: topStudents || [], subjects: subjects || [], leaves: leaves || [] });
        } catch { showToast('Failed to Load', 'error'); }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadData(); }, []);

    const handleDeleteUser = async (id, name) => {
        if (!confirm(`Permanently delete ${name}?`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { showToast('User Deleted'); loadData(); }
        } catch { showToast('Delete Failed', 'error'); }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { type, mode, data: initialData } = modalConfig;
        let url = `${API_URL}/admin/${type}s`;
        if (mode === 'edit') url += `/${initialData.id}`;
        try {
            const res = await fetch(url, { method: mode === 'add' ? 'POST' : 'PUT', headers, body: JSON.stringify(formData) });
            if (res.ok) { showToast('Saved Successfully'); setModalConfig({ isOpen: false, type: '', mode: '', data: null }); loadData(); }
        } catch { showToast('Error Saving', 'error'); }
    };

    const openModal = (type, mode, initialData = null) => {
        setModalConfig({ isOpen: true, type, mode, data: initialData });
        if (mode === 'edit' && initialData) setFormData({ ...initialData });
        else setFormData(type === 'user' ? { role: 'student' } : { date: new Date().toISOString().split('T')[0], radius: 100 });
    };

    const downloadCSV = (dataItems, filename) => {
        if (!dataItems.length) return;
        const csv = [Object.keys(dataItems[0]).join(','), ...dataItems.map(obj => Object.values(obj).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    };

    const lineData = {
        labels: data.trend.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [{ label: 'Attendance Trend', data: data.trend.map(d => d.count), backgroundColor: 'rgba(90, 20, 119, 0.1)', borderColor: '#4B1D6F', borderWidth: 4, pointBackgroundColor: '#fff', fill: true, tension: 0.4 }]
    };

    const barData = {
        labels: data.subjects.slice(0, 5).map(s => s.subject?.substring(0, 10)),
        datasets: [{ label: 'Avg Logs', data: data.subjects.slice(0, 5).map(s => s.attendance_count), backgroundColor: ['#4B1D6F', '#F39200', '#8b5cf6', '#3b82f6', '#10b981'], borderRadius: 12 }]
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="font-black text-slate-300 uppercase tracking-widest animate-pulse">Loading......</p></div>;

    return (
        <div className="portal-container animate-floatUp pb-12">
            {toast && <div className={`fixed top-24 right-8 z-[3000] px-8 py-4 rounded-2xl shadow-2xl text-white font-black text-[10px] uppercase tracking-[4px] border ${toast.type === 'error' ? 'bg-red-600 border-red-500' : 'bg-[#4B1D6F] border-purple-800'}`}>{toast.message}</div>}
            
            <header className="section-header">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[28px] bg-gradient-to-br from-[#4B1D6F] to-[#3a1656] flex items-center justify-center shadow-2xl text-white">
                        <ShieldIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="section-title-alt">Admin Dashboard</h2>
                        <p className="text-slate-500 font-medium mt-1">Admin management panel for <span className="text-[#4B1D6F] font-bold uppercase">{user.name}</span></p>
                    </div>
                </div>
                <div className="flex bg-slate-50 p-2 rounded-[24px] border border-slate-100">
                    {['overview', 'analytics', 'users', 'lectures', 'attendance', 'leaves'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-white text-[#4B1D6F] shadow-xl shadow-[#4B1D6F]/10 scale-105' : 'text-slate-400 hover:text-[#4B1D6F]'}`}>{tab}</button>
                    ))}
                </div>
            </header>

            {activeTab === 'overview' && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <HeaderStats label="Total Students" value={data.stats.total_students} icon={<GraduationCapIcon className="w-6 h-6" />} />
                        <HeaderStats label="Total Teachers" value={data.stats.total_teachers} icon={<UserIcon className="w-6 h-6" />} />
                        <HeaderStats label="Total Lectures" value={data.stats.total_lectures} icon={<BookOpenIcon className="w-6 h-6" />} />
                        <HeaderStats label="Attendance Records" value={data.stats.total_attendance_records} icon={<ActivityIcon className="w-6 h-6" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 dashboard-card border-2 border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Attendance Trend</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional presence trends</p></div>
                            </div>
                            <div className="h-[400px] w-full"><Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { borderDash: [4, 4] } }, x: { grid: { display: false } } } }} /></div>
                        </div>
                        <div className="space-y-8">
                            <div className="dashboard-card border-2 border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Subject Attendance</h3>
                                <div className="h-[250px]"><Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                            </div>
                            <div className="dashboard-card bg-[#4B1D6F] text-white">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-8 opacity-60">Total Users</h3>
                                <div className="h-[200px] flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-5xl font-black tracking-tight">{data.users.length}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-[4px] mt-2 opacity-50">Total Managed Identities</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && <UsersTab allUsers={data.users} onAdd={() => openModal('user', 'add')} onEdit={(u) => openModal('user', 'edit', u)} onDelete={handleDeleteUser} onDownload={() => downloadCSV(data.users, 'users_list.csv')} />}

            {activeTab === 'analytics' && (
                <div className="space-y-8 animate-floatUp">
                    <header className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Advanced Analytics</h3>
                    </header>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="dashboard-card">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Top Performing Students</h3>
                            {data.topStudents && data.topStudents.length > 0 ? (
                                <table className="mit-table">
                                    <thead><tr><th>Rank</th><th>Name</th><th>Attendance</th></tr></thead>
                                    <tbody>
                                        {data.topStudents.map((s, i) => (
                                            <tr key={i}><td>#{i+1}</td><td className="font-bold">{s.name}</td><td className="text-green-600 font-black">{parseFloat(s.attendance_percentage).toFixed(1)}%</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <EmptyState icon={<BarChartIcon className="w-8 h-8 text-slate-200" />} title="No Data" desc="Insufficient data for analytics" />}
                        </div>
                        <div className="dashboard-card">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Subject Statistics</h3>
                            {data.subjects && data.subjects.length > 0 ? (
                                <table className="mit-table">
                                    <thead><tr><th>Subject</th><th>Logs</th></tr></thead>
                                    <tbody>
                                        {data.subjects.map((s, i) => (
                                            <tr key={i}><td className="font-bold">{s.subject}</td><td className="text-[#4B1D6F] font-black">{s.attendance_count}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <EmptyState icon={<BarChartIcon className="w-8 h-8 text-slate-200" />} title="No Data" desc="Insufficient data for subjects" />}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'lectures' && (
                <div className="space-y-8 animate-floatUp">
                    <header className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Lecture Logs</h3>
                        <button onClick={() => downloadCSV(data.lectures, 'lectures.csv')} className="btn-mit btn-mit-outline py-2 px-4 text-[10px]"><DownloadIcon className="w-4 h-4" /> Export CSV</button>
                    </header>
                    {data.lectures && data.lectures.length > 0 ? (
                        <div className="dashboard-card !p-0 overflow-hidden">
                            <table className="mit-table">
                                <thead><tr><th>Name</th><th>Subject</th><th>Date</th><th>Status</th></tr></thead>
                                <tbody>
                                    {data.lectures.map(l => (
                                        <tr key={l.id}>
                                            <td className="font-bold">{l.name}</td>
                                            <td>{l.subject}</td>
                                            <td>{new Date(l.date).toLocaleDateString()}</td>
                                            <td><span className={`px-2 py-1 rounded text-[10px] font-black ${l.status === 'archived' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'}`}>{l.status || 'active'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <EmptyState icon={<BookOpenIcon className="w-8 h-8 text-slate-200" />} title="No Lectures" desc="No lectures have been recorded yet." />}
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="space-y-8 animate-floatUp">
                    <header className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Attendance Records</h3>
                        <button onClick={() => downloadCSV(data.attendance, 'attendance.csv')} className="btn-mit btn-mit-outline py-2 px-4 text-[10px]"><DownloadIcon className="w-4 h-4" /> Export CSV</button>
                    </header>
                    {data.attendance && data.attendance.length > 0 ? (
                        <div className="dashboard-card !p-0 overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table className="mit-table">
                                <thead><tr><th>Student</th><th>Lecture</th><th>Time</th></tr></thead>
                                <tbody>
                                    {data.attendance.map(a => (
                                        <tr key={a.id}>
                                            <td className="font-bold">{a.student_name}</td>
                                            <td>{a.lecture_name || `ID: ${a.lecture_id}`}</td>
                                            <td>{new Date(a.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <EmptyState icon={<ActivityIcon className="w-8 h-8 text-slate-200" />} title="No Records" desc="No attendance records found." />}
                </div>
            )}

            {activeTab === 'leaves' && (
                <div className="space-y-8 animate-floatUp">
                    <header className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Leave Requests</h3>
                        <button onClick={() => downloadCSV(data.leaves, 'leaves.csv')} className="btn-mit btn-mit-outline py-2 px-4 text-[10px]"><DownloadIcon className="w-4 h-4" /> Export CSV</button>
                    </header>
                    {data.leaves && data.leaves.length > 0 ? (
                        <div className="dashboard-card !p-0 overflow-hidden">
                            <table className="mit-table">
                                <thead><tr><th>Student</th><th>Reason</th><th>Dates</th><th>Status</th></tr></thead>
                                <tbody>
                                    {data.leaves.map(l => (
                                        <tr key={l.id}>
                                            <td className="font-bold">{l.student_name}</td>
                                            <td className="max-w-[200px] truncate">{l.reason}</td>
                                            <td>{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</td>
                                            <td><span className={`px-2 py-1 rounded text-[10px] font-black ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{l.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <EmptyState icon={<CalendarIcon className="w-8 h-8 text-slate-200" />} title="No Requests" desc="No leave requests found." />}
                </div>
            )}

            {/* Modal for User/Lecture Management */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#4B1D6F]/40 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-floatUp">
                        <div className="p-10 bg-white border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{modalConfig.mode === 'add' ? 'ADD' : 'EDIT'} {modalConfig.type.toUpperCase()}</h3>
                            <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all"><XIcon className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-10 space-y-6">
                            {modalConfig.type === 'user' && (
                                <>
                                    {modalConfig.mode === 'add' && <InputField id="id" label="User ID" type="text" placeholder="e.g., T263" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />}
                                    <InputField id="name" label="Full Name" type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    <InputField id="email" label="Email Address" type="email" placeholder="email@mit.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    {modalConfig.mode === 'add' && <InputField id="password" label="Password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">ROLE Level</label>
                                        <select className="input-field-professional py-3 text-sm font-bold" value={formData.role || 'student'} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="btn-mit btn-mit-purple w-full py-4 text-sm font-black shadow-xl shadow-[#4B1D6F]/10">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
