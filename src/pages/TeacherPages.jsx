import React, { useState, useEffect } from 'react';
import { InputField } from '../components/InputField.jsx';
import { LocationPicker } from '../components/LocationPicker.jsx';
import { 
    BookOpenIcon, PlusIcon, QrCodeIcon, CalendarIcon, 
    DownloadIcon, BarChartIcon, MapPinIcon, MailIcon, 
    CalendarDaysIcon, CheckIcon, XIcon, ArrowLeftIcon, ActivityIcon
} from '../components/Icons.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { io } from 'socket.io-client';

const API_URL = "https://attendence-backend-tfw2.onrender.com/api";

const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const TeacherDashboard = ({ user, setView, lectures, activeLecture, setActiveLecture, token }) => {
    const [liveAttendance, setLiveAttendance] = useState([]);
    const [countdown, setCountdown] = useState(30);
    const [manualLecture, setManualLecture] = useState(null);
    const [manualStudents, setManualStudents] = useState([]);
    const [isSavingManual, setIsSavingManual] = useState(false);
    const [showLeaves, setShowLeaves] = useState(false);
    const [teacherLeaves, setTeacherLeaves] = useState([]);
    const [isLeavesLoading, setIsLeavesLoading] = useState(false);

    const fetchTeacherLeaves = async () => {
        setIsLeavesLoading(true);
        try {
            const res = await fetch(`${API_URL}/teacher/leaves`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setTeacherLeaves(data);
        } catch (e) { console.error(e); }
        setIsLeavesLoading(false);
    };

    const handleUpdateLeaveStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/teacher/leaves/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchTeacherLeaves();
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (showLeaves) fetchTeacherLeaves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showLeaves]);

    useEffect(() => {
        if (!activeLecture) {
            setLiveAttendance([]);
            return;
        }
        setCountdown(30);

        const fetchLiveAttendance = async () => {
            try {
                const res = await fetch(`${API_URL}/teacher/lectures/${activeLecture.id}/attendance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setLiveAttendance(data);
            } catch (error) {
                console.error("Failed to fetch live attendance:", error);
            }
        };

        fetchLiveAttendance();

        const backendUrl = API_URL.replace('/api', '');
        const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
        
        socket.on('connect', () => {
            socket.emit('join_teacher_room', user.id);
        });

        socket.on('attendance_marked', (data) => {
            if (data.lectureId === activeLecture.id) {
                fetchLiveAttendance();
            }
        });

        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    socket.disconnect();
                    setActiveLecture(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { 
            socket.disconnect(); 
            clearInterval(countdownInterval); 
        };
    }, [activeLecture, token, setActiveLecture, user.id]);

    const handleDownloadLectureReport = async (lecture) => {
        try {
            const res = await fetch(`${API_URL}/teacher/lecture-report/${lecture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch report');

            const headers = "Sr. No,Roll Number,Enrollment Number,Name,Time Attended,Status\n";
            let rows = "";

            if (data.length > 0) {
                rows = data.map((row, index) => {
                    const status = row.timestamp ? 'Present' : 'Absent';
                    const time = row.timestamp ? new Date(row.timestamp).toLocaleString() : 'N/A';
                    return `${index + 1},${row.roll_number || 'N/A'},${row.enrollment_number || 'N/A'},"${row.student_name}",${time},${status}`;
                }).join('\n');
            } else {
                rows = "No students found in the system.";
            }

            downloadCSV(headers + rows, `lecture_${lecture.name.replace(/\s+/g, '_')}_report.csv`);

        } catch (error) {
            console.error("Failed to download report:", error);
            alert("Error downloading report.");
        }
    };

    const openManualAttendance = async (lecture) => {
        try {
            const res = await fetch(`${API_URL}/teacher/lecture-report/${lecture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch report');
            
            const studentsForManual = data.map(row => ({
                studentId: row.student_id || row.id,
                name: row.student_name,
                roll_number: row.roll_number,
                status: row.timestamp ? 'present' : 'absent'
            }));
            setManualStudents(studentsForManual);
            setManualLecture(lecture);
        } catch (error) {
            console.error("Failed to fetch students for manual entry:", error);
            alert("Error fetching students.");
        }
    };

    const handleSaveManualAttendance = async () => {
        setIsSavingManual(true);
        try {
            const res = await fetch(`${API_URL}/teacher/lectures/${manualLecture.id}/manual-attendance`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ attendanceData: manualStudents })
            });
            if (res.ok) {
                alert('Attendance updated successfully!');
                setManualLecture(null);
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error saving manual attendance:", error);
            alert("Error saving attendance.");
        } finally {
            setIsSavingManual(false);
        }
    };

    return (
        <div className="portal-container animate-floatUp">
            <header className="section-header">
                <div>
                    <h2 className="section-title-alt">Faculty Control Centre</h2>
                    <p className="text-slate-500 font-medium mt-1">Institutional academic management for <span className="text-[#F39200] font-bold uppercase">{user.name}</span></p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowLeaves(true)} className="btn-mit btn-mit-outline relative group">
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span>Leave Requests</span>
                        {teacherLeaves.filter(l => l.status === 'pending').length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse border-2 border-white">{teacherLeaves.filter(l => l.status === 'pending').length}</span>
                        )}
                    </button>
                    <button onClick={() => setView('reports')} className="btn-mit btn-mit-outline">
                        <BarChartIcon className="w-5 h-5" />
                        <span>Master Register</span>
                    </button>
                    <button onClick={() => setView('createLecture')} className="btn-mit btn-mit-purple shadow-xl">
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Lecture</span>
                    </button>
                </div>
            </header>

            {activeLecture ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-1 dashboard-card text-center border-green-500 border-2 bg-green-50/30">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                            <h2 className="text-xl font-black text-green-600 uppercase tracking-widest">Lecture Active</h2>
                        </div>
                        <div className="mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">QR Code Expiry</p>
                            <p className="text-5xl font-black text-red-600">{countdown}s</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-inner border border-slate-100 inline-block">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeLecture.qrUrl)}`}
                                alt="Active QR Code"
                                className="w-48 h-48 mx-auto"
                            />
                        </div>
                        <div className="mt-8 text-left bg-white p-5 rounded-2xl border border-slate-100">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">{activeLecture.name}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{activeLecture.time}</p>
                        </div>
                        <button onClick={() => setActiveLecture(null)} className="btn-mit btn-mit-outline w-full mt-6 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-500">
                            Terminate Protocol
                        </button>
                    </div>
                    <div className="lg:col-span-2 dashboard-card flex flex-col h-[520px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Live Enrollment Terminal</h3>
                            <span className="bg-[#4B1D6F] text-white text-[10px] font-black px-3 py-1 rounded-full">{liveAttendance.length} PRESENT</span>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {liveAttendance.length > 0 ? liveAttendance.map(record => (
                                <div key={record.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                            <CheckIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{record.student_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VERIFIED SYNC</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-[#F39200] bg-[#f5f0ff] px-3 py-1 rounded-lg">{new Date(record.timestamp).toLocaleTimeString()}</span>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <ActivityIcon className="w-16 h-16 mb-4 opacity-20 animate-pulse" />
                                    <p className="font-black text-sm uppercase tracking-[4px]">Awaiting Uplink...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px] p-16 text-center mb-12 animate-fadeIn">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <ActivityIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">System Idle</h2>
                    <p className="text-slate-400 font-medium mt-2">ADD a lecture cycle from the directory below to begin tracking.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {lectures.length > 0 ? lectures.map(lecture => (
                    <div key={lecture.id} className={`dashboard-card liquid-hover group border-2 ${activeLecture?.id === lecture.id ? 'border-[#4B1D6F]' : 'border-transparent'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#4B1D6F] group-hover:bg-[#4B1D6F] group-hover:text-white transition-all duration-300">
                                <BookOpenIcon className="w-6 h-6" />
                            </div>
                            {lecture.latitude && (
                                <span className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest flex items-center gap-1">
                                    <MapPinIcon className="w-3 h-3" /> GEOFENCED
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-[#4B1D6F] transition-colors">{lecture.name}</h3>
                        <p className="text-xs text-[#F39200] font-bold uppercase tracking-widest mb-6">{lecture.subject}</p>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Session Protocol</p>
                                <p className="text-sm font-bold text-slate-600">{lecture.time}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setActiveLecture(lecture)} disabled={!!activeLecture} className="btn-mit btn-mit-purple w-full py-3 text-[10px]">
                                ACTIVATE
                            </button>
                            <button onClick={() => openManualAttendance(lecture)} disabled={!!activeLecture} className="btn-mit btn-mit-orange w-full py-3 text-[10px]">
                                MANUAL
                            </button>
                            <button onClick={() => handleDownloadLectureReport(lecture)} disabled={!!activeLecture} className="btn-mit btn-mit-outline w-full col-span-2 py-3 text-[10px]">
                                <DownloadIcon className="w-4 h-4" /> GENERATE REPORT
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-300">
                            <BookOpenIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">No Active Directory</h3>
                        <p className="text-slate-500 font-medium mt-2">ADD your first lecture cycle to get started.</p>
                        <button onClick={() => setView('createLecture')} className="btn-mit btn-mit-purple mx-auto mt-8">
                            <PlusIcon className="w-5 h-5" /> ADD Lecture
                        </button>
                    </div>
                )}
            </div>

            {/* Manual Attendance Modal */}
            {manualLecture && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#4B1D6F]/40 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-floatUp border border-white/20">
                        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Manual Attendance</h2>
                                <p className="text-xs text-[#F39200] font-bold uppercase tracking-widest mt-1">{manualLecture.name}</p>
                            </div>
                            <button onClick={() => setManualLecture(null)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
                            <table className="mit-table shadow-sm rounded-2xl overflow-hidden bg-white">
                                <thead>
                                    <tr>
                                        <th>ROLL NO</th>
                                        <th>STUDENT NAME</th>
                                        <th className="text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manualStudents.map((student, index) => (
                                        <tr key={student.studentId}>
                                            <td className="font-bold text-[#4B1D6F]">{student.roll_number || '---'}</td>
                                            <td className="font-bold uppercase text-[12px] tracking-tight text-slate-700">{student.name}</td>
                                            <td className="text-center">
                                                <button
                                                    onClick={() => {
                                                        const updated = [...manualStudents];
                                                        updated[index].status = student.status === 'present' ? 'absent' : 'present';
                                                        setManualStudents(updated);
                                                    }}
                                                    className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                        student.status === 'present' 
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}
                                                >
                                                    {student.status}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 border-t border-slate-100 bg-white">
                            <button
                                onClick={handleSaveManualAttendance}
                                disabled={isSavingManual}
                                className="btn-mit btn-mit-purple w-full py-4 shadow-xl shadow-[#4B1D6F]/10"
                            >
                                {isSavingManual ? 'SYNCHRONIZING...' : 'COMMIT ATTENDANCE CHANGES'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Management Modal */}
            {showLeaves && (
                <div className="fixed inset-0 bg-[#4B1D6F]/40 backdrop-blur-md z-[2000] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-floatUp">
                        <div className="p-10 bg-white border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#4B1D6F]">
                                    <CalendarDaysIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Student Leave Requests</h3>
                                    <p className="text-xs text-[#F39200] font-bold uppercase tracking-widest mt-1">Review academic absence requests</p>
                                </div>
                            </div>
                            <button onClick={() => setShowLeaves(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                                <XIcon className="w-7 h-7" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 custom-scrollbar">
                            {isLeavesLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-8 border-slate-100 border-t-[#4B1D6F] rounded-full animate-spin mb-4"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decrypting Requests...</p>
                                </div>
                            ) : teacherLeaves.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                        <CalendarDaysIcon className="w-10 h-10" />
                                    </div>
                                    <p className="text-lg font-black text-slate-400 uppercase tracking-widest">No Petitions Found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {teacherLeaves.map(leave => (
                                        <div key={leave.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all hover:shadow-xl hover:border-[#4B1D6F]/10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <h4 className="font-black text-slate-800 text-xl uppercase tracking-tight">{leave.student_name}</h4>
                                                    <span className="bg-slate-50 text-slate-400 font-black text-[10px] px-3 py-1 rounded-lg uppercase tracking-widest">{leave.roll_number}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-[#4B1D6F]" /> {new Date(leave.start_date).toLocaleDateString()} — {new Date(leave.end_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-2xl text-sm text-slate-600 italic border-l-4 border-[#F39200] font-medium leading-relaxed shadow-inner">
                                                    "{leave.reason}"
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-row lg:flex-col gap-3 min-w-[160px]">
                                                {leave.status === 'pending' ? (
                                                    <>
                                                        <button onClick={() => handleUpdateLeaveStatus(leave.id, 'approved')} className="flex-1 btn-mit btn-mit-purple py-3 text-[10px]">
                                                            <CheckIcon className="w-4 h-4" /> AUTHORIZE
                                                        </button>
                                                        <button onClick={() => handleUpdateLeaveStatus(leave.id, 'rejected')} className="flex-1 btn-mit btn-mit-outline border-red-100 text-red-500 hover:bg-red-50 hover:border-red-500 py-3 text-[10px]">
                                                            <XIcon className="w-4 h-4" /> DENY
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className={`text-center py-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[3px] border ${leave.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                        {leave.status}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AttendanceReportsPage = ({ teacherId, token, setView }) => {
    const [defaulters, setDefaulters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [isDownloadingMonthly, setIsDownloadingMonthly] = useState(false);
    const [isSendingAlerts, setIsSendingAlerts] = useState(false);
    const [isDownloadingCumulative, setIsDownloadingCumulative] = useState(false);


    const MONTHS = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];

    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 4 }, (_, i) => String(currentYear - i));

    useEffect(() => {
        const fetchDefaulters = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/teacher/reports/defaulters/${teacherId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setDefaulters(await res.json());
            } catch (error) { console.error(error); }
            finally { setIsLoading(false); }
        };
        fetchDefaulters();
    }, [teacherId, token]);

    const handleSendAlerts = async () => {
        if (!window.confirm('Send deficiency alerts to students/parents?')) return;
        setIsSendingAlerts(true);
        try {
            await fetch(`${API_URL}/teacher/reports/send-alerts/${teacherId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Alerts sent successfully.');
        } catch { alert('Failed to send alerts.'); }
        setIsSendingAlerts(false);
    };

    const getReportDataAndHeaders = (students, lectures, records) => {
        if (!lectures || lectures.length === 0) return null;
        const attendanceLookup = {};
        records.forEach(rec => {
            if (!attendanceLookup[rec.student_id]) attendanceLookup[rec.student_id] = new Set();
            attendanceLookup[rec.student_id].add(rec.lecture_id);
        });
        const dateHeaders = lectures.map(l => {
            const d = new Date(l.date);
            return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}\n${l.subject}`;
        });
        const headers = ['Sr. No', 'Roll Number', 'Name', ...dateHeaders, 'Present', 'Total', '%'];
        const rows = students.map((student, index) => {
            const attendedSet = attendanceLookup[student.id] || new Set();
            let attendedCount = 0;
            const statusCells = lectures.map(lecture => {
                const isPresent = attendedSet.has(lecture.id);
                if (isPresent) attendedCount++;
                return isPresent ? 'P' : 'A';
            });
            const pct = lectures.length > 0 ? ((attendedCount / lectures.length) * 100).toFixed(1) : '0.0';
            return [index + 1, student.roll_number || '---', student.name, ...statusCells, attendedCount, lectures.length, `${pct}%`];
        });
        return { headers, rows };
    };

    const downloadExcel = (data, fileName) => {
        const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    const downloadPDF = (data, title, fileName) => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(16); doc.text(title, 14, 15);
        autoTable(doc, { head: [data.headers], body: data.rows, startY: 25, styles: { fontSize: 7, font: 'helvetica' }, headStyles: { fillColor: [90, 20, 119] } });
        doc.save(`${fileName}.pdf`);
    };

    const handleDownloadCumulative = async (format) => {
        setIsDownloadingCumulative(true);
        try {
            const res = await fetch(`${API_URL}/teacher/reports/cumulative/${teacherId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const d = await res.json();
            const report = getReportDataAndHeaders(d.students, d.lectures, d.records);
            if (format === 'excel') downloadExcel(report, 'cumulative_report');
            else downloadPDF(report, 'Cumulative Master Register', 'cumulative_report');
        } catch { alert('Error generating report.'); }
        setIsDownloadingCumulative(false);
    };

    const handleDownloadMonthly = async (format) => {
        setIsDownloadingMonthly(true);
        try {
            const res = await fetch(`${API_URL}/teacher/reports/monthly/${teacherId}?month=${selectedMonth}&year=${selectedYear}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const d = await res.json();
            const report = getReportDataAndHeaders(d.students, d.lectures, d.records);
            if (format === 'excel') downloadExcel(report, `monthly_report_${selectedMonth}`);
            else downloadPDF(report, `Monthly Report - ${selectedMonth}/${selectedYear}`, `monthly_report_${selectedMonth}`);
        } catch { alert('Error generating report.'); }
        setIsDownloadingMonthly(false);
    };

    return (
        <div className="portal-container animate-floatUp">
            <header className="section-header">
                <div>
                    <button onClick={() => setView('teacherHome')} className="flex items-center gap-2 text-slate-400 hover:text-[#4B1D6F] font-black text-[10px] uppercase tracking-widest mb-4 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h2 className="section-title-alt">Academic Intelligence Terminal</h2>
                    <p className="text-slate-500 font-medium mt-1">Institutional attendance analytics and compliance reporting</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="dashboard-card border-l-4 border-l-[#4B1D6F]">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#4B1D6F]">
                            <BarChartIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cumulative Ledger</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Comprehensive historical data sync</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                        Generate the complete institutional register containing all lecture dates, student statuses, and total percentages from the first academic cycle.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleDownloadCumulative('excel')} disabled={isDownloadingCumulative} className="btn-mit btn-mit-purple py-4 text-[10px]">
                            {isDownloadingCumulative ? 'GENERATING...' : 'EXPORT EXCEL (.XLSX)'}
                        </button>
                        <button onClick={() => handleDownloadCumulative('pdf')} disabled={isDownloadingCumulative} className="btn-mit btn-mit-outline py-4 text-[10px]">
                            {isDownloadingCumulative ? 'GENERATING...' : 'EXPORT PDF (.PDF)'}
                        </button>
                    </div>
                </div>

                <div className="dashboard-card border-l-4 border-l-[#F39200]">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#F39200]">
                            <CalendarIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Periodical Reports</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Month-specific data extraction</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cycle Month</label>
                            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="input-field-professional py-3 text-sm font-bold">
                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cycle Year</label>
                            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="input-field-professional py-3 text-sm font-bold">
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleDownloadMonthly('excel')} disabled={isDownloadingMonthly} className="btn-mit btn-mit-orange py-4 text-[10px]">
                            {isDownloadingMonthly ? 'EXTRACTING...' : 'DOWNLOAD MONTHLY EXCEL'}
                        </button>
                        <button onClick={() => handleDownloadMonthly('pdf')} disabled={isDownloadingMonthly} className="btn-mit btn-mit-outline border-[#F39200] text-[#F39200] hover:bg-[#F39200] py-4 text-[10px]">
                            {isDownloadingMonthly ? 'EXTRACTING...' : 'DOWNLOAD MONTHLY PDF'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-card mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <XIcon className="w-8 h-8 text-red-500" />
                            Academic Defaulter Protocol
                        </h3>
                        <p className="text-xs text-red-500 font-black uppercase tracking-widest mt-1">Students below 75% Attendance Rate</p>
                    </div>
                    <button 
                        onClick={handleSendAlerts}
                        disabled={isSendingAlerts || defaulters.length === 0}
                        className="btn-mit btn-mit-purple bg-red-600 hover:bg-red-700 py-4 px-8 shadow-xl shadow-red-900/10 text-[10px]"
                    >
                        {isSendingAlerts ? 'Submitting ALERTS...' : 'COMMENCE DEFICIENCY ALERTS'}
                    </button>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="w-12 h-12 border-4 border-[#4B1D6F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Databases...</p>
                    </div>
                ) : defaulters.length > 0 ? (
                    <div className="overflow-hidden rounded-[24px] border border-slate-100 shadow-sm">
                        <table className="mit-table">
                            <thead>
                                <tr>
                                    <th>STUDENT IDENTITY</th>
                                    <th>ROLL NUMBER</th>
                                    <th>COMPLIANCE</th>
                                    <th className="text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {defaulters.map(student => (
                                    <tr key={student.id}>
                                        <td className="font-black text-slate-700 uppercase text-xs">{student.name}</td>
                                        <td className="font-bold text-slate-400 text-xs">{student.roll_number || '---'}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500 rounded-full" style={{width: `${student.percentage}%`}}></div>
                                                </div>
                                                <span className="font-black text-red-600 text-xs w-10">{student.percentage.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-[2px] border border-red-100">DEFICIENT</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-green-500">
                            <CheckIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Full Compliance Achieved</h3>
                        <p className="text-slate-500 font-medium mt-2">All students currently meet the 75% institutional attendance threshold.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const getCurrentTimeRange = () => {
    const now = new Date();
    const start = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    now.setHours(now.getHours() + 1);
    const end = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${start} - ${end}`;
};

export const CreateLecturePage = ({ setView, addLecture }) => {
    const [lectureDetails, setLectureDetails] = useState({ subject: '', date: new Date().toISOString().split('T')[0], time: getCurrentTimeRange(), name: '' });
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [radius, setRadius] = useState(100);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => setLectureDetails(prev => ({ ...prev, [e.target.id]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = { ...lectureDetails, latitude: location.latitude, longitude: location.longitude, radius };
        const result = await addLecture(payload);
        if (result) setView('teacherHome');
        setIsSubmitting(false);
    };

    return (
        <div className="portal-container animate-floatUp pb-20">
            <header className="section-header">
                <div>
                    <button onClick={() => setView('teacherHome')} className="flex items-center gap-2 text-slate-400 hover:text-[#4B1D6F] font-black text-[10px] uppercase tracking-widest mb-4 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" /> Cancel Creation
                    </button>
                    <h2 className="section-title-alt">Lecture Initialization</h2>
                    <p className="text-slate-500 font-medium mt-1">Configure a new academic attendance cycle</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                <div className="dashboard-card p-10">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid md:grid-cols-2 gap-8">
                            <InputField id="name" label="Lecture Title" type="text" placeholder="e.g., Computer Networks - A2" icon={<BookOpenIcon className="w-5 h-5" />} value={lectureDetails.name} onChange={handleInputChange} />
                            <InputField id="subject" label="Subject Code" type="text" placeholder="e.g., CS401" icon={<BookOpenIcon className="w-5 h-5" />} value={lectureDetails.subject} onChange={handleInputChange} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <InputField id="date" label="Cycle Date" type="date" icon={<CalendarIcon className="w-5 h-5" />} value={lectureDetails.date} onChange={handleInputChange} />
                            <InputField id="time" label="Cycle Time" type="text" placeholder="e.g., 10:00 AM - 11:00 AM" icon={<CalendarDaysIcon className="w-5 h-5" />} value={lectureDetails.time} onChange={handleInputChange} />
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                            <div className="flex items-center gap-3 mb-8">
                                <MapPinIcon className="w-6 h-6 text-[#F39200]" />
                                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Geofencing Protocol</h4>
                            </div>
                            <LocationPicker onLocationSelect={setLocation} currentRadius={radius} onRadiusChange={setRadius} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-6 leading-relaxed">
                                Enable precise location verification to ensure students are physically present within the specified radius of the lecture hall.
                            </p>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-mit btn-mit-purple w-full py-5 text-sm font-black shadow-2xl shadow-[#4B1D6F]/20">
                            {isSubmitting ? 'INITIALIZING CYCLE...' : 'ADD ATTENDANCE CYCLE'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};