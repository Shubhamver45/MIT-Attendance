import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { TeacherLoginPage, TeacherRegisterPage, StudentLoginPage, StudentRegisterPage, AdminLoginPage } from './pages/AuthPages.jsx';
import { TeacherDashboard, AttendanceReportsPage, CreateLecturePage } from './pages/TeacherPages.jsx';
import { StudentDashboard, ScanQRCodePage, ViewSchedulePage, StudentProfilePage } from './pages/StudentPages.jsx';
import { AdminDashboard } from './pages/AdminPages.jsx';

const API_URL = import.meta.env.VITE_API_URL || "https://attendence-backend-tfw2.onrender.com/api";

export default function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('landing');
    const [lectures, setLectures] = useState([]);
    const [activeLecture, setActiveLecture] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [lectureNotification, setLectureNotification] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const initializeApp = async () => {
            fetch(`${API_URL}/health`).catch(() => {});
            const keepAlive = setInterval(() => {
                fetch(`${API_URL}/health`).catch(() => {});
            }, 600000);

            const storedToken = sessionStorage.getItem('token');
            const storedUser = JSON.parse(sessionStorage.getItem('user'));
            const urlParams = new URLSearchParams(window.location.search);
            const lectureIdFromUrl = urlParams.get('lectureId');

            if (storedToken && storedUser) {
                setUser(storedUser);
                setToken(storedToken);
                await fetchDataForUser(storedUser, storedToken, lectureIdFromUrl);
            } else if (lectureIdFromUrl) {
                sessionStorage.setItem('pendingLectureId', lectureIdFromUrl);
                setView('studentLogin');
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
            return () => clearInterval(keepAlive);
        };
        initializeApp();
    }, []);

    useEffect(() => {
        if (user?.role === 'student' && notificationPermission === 'default') {
            Notification.requestPermission().then(setNotificationPermission);
        }
    }, [user, notificationPermission]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const fetchDataForUser = async (userData, userToken, lectureIdFromUrl = null) => {
        try {
            let lectureData = [];
            let attendanceData = [];

            if (userData.role === 'admin') {
                setIsLoading(false);
                setView('adminHome');
                return;
            } else if (userData.role === 'teacher') {
                const lectureRes = await fetch(`${API_URL}/teacher/lectures/${userData.id}`, { headers: { 'Authorization': `Bearer ${userToken}` } });
                lectureData = await lectureRes.json();
                const studentsRes = await fetch(`${API_URL}/teacher/all-students`, { headers: { 'Authorization': `Bearer ${userToken}` } });
                const allAttendanceRes = await fetch(`${API_URL}/teacher/all-attendance`, { headers: { 'Authorization': `Bearer ${userToken}` } });
                if (studentsRes.ok) setRegisteredStudents(await studentsRes.json());
                if (allAttendanceRes.ok) setAttendanceRecords(await allAttendanceRes.json());
            } else {
                const [lectureRes, attendanceRes] = await Promise.all([
                    fetch(`${API_URL}/student/lectures`, { headers: { 'Authorization': `Bearer ${userToken}` } }),
                    fetch(`${API_URL}/student/attendance/${userData.id}`, { headers: { 'Authorization': `Bearer ${userToken}` } })
                ]);
                if (!lectureRes.ok) throw new Error('Failed to fetch lectures');
                lectureData = await lectureRes.json();
                if (attendanceRes.ok) attendanceData = await attendanceRes.json();
            }

            setLectures(lectureData);
            setAttendanceRecords(attendanceData);

            if (lectureIdFromUrl && userData.role === 'student') {
                const lectureToAttend = lectureData.find(l => l.id === parseInt(lectureIdFromUrl));
                if (lectureToAttend) setLectureNotification(lectureToAttend);
                setView('studentHome');
            } else {
                setView(userData.role === 'teacher' ? 'teacherHome' : 'studentHome');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Removed showNotification since it was unused

    const handleLogin = async (email, password, role) => {
        try {
            const res = await fetch(`${API_URL}/auth/${role}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            const pendingLectureId = sessionStorage.getItem('pendingLectureId');
            await fetchDataForUser(data.user, data.token, pendingLectureId);
            if (pendingLectureId) sessionStorage.removeItem('pendingLectureId');
        } catch (error) {
            console.error("Login error:", error);
            if (error.message === 'Failed to fetch' || error.message.includes('network')) {
                alert("Connection Error: Your server is currently waking up. Please wait ~30 seconds and try again!");
            } else {
                alert(`Login Failed: ${error.message}`);
            }
        }
    };

    const handleRegister = async (formData) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            alert('Registration successful! Please log in.');
            setView(formData.role === 'teacher' ? 'teacherLogin' : 'studentLogin');
        } catch (error) {
            console.error("Registration error:", error);
            alert(`Registration Failed: ${error.message}`);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        setUser(null); setToken(null); setView('landing');
        setLectures([]); setActiveLecture(null); setAttendanceRecords([]);
        window.history.pushState({}, '', window.location.pathname);
    };

    const addLecture = async (lectureData) => {
        try {
            const res = await fetch(`${API_URL}/teacher/lectures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...lectureData, teacher_id: user.id })
            });
            const newLecture = await res.json();
            if (!res.ok) throw new Error(newLecture.error || 'Failed to create');
            setLectures(prev => [{ ...newLecture, teacher_name: user.name }, ...prev]);
            return newLecture;
        } catch (error) { alert(`Error: ${error.message}`); return null; }
    };

    const markAttendance = async (lectureId) => {
        if (!lectureId) { alert("Invalid Lecture ID."); return false; }
        try {
            const res = await fetch(`${API_URL}/student/mark-attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ lectureId, studentId: user.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to mark attendance');
            setAttendanceRecords(prev => [...prev, {
                id: data.newRecordId,
                lecture_id: parseInt(lectureId),
                student_id: user.id,
                status: 'present',
                timestamp: new Date().toISOString()
            }]);
            return true;
        } catch (error) { alert(`Failed: ${error.message}`); return false; }
    };

    const handleSetActiveLecture = (lecture) => {
        setActiveLecture(lecture);
        if (lecture) {
            setLectureNotification(lecture);
            if (notificationPermission === 'granted') {
                new Notification(`Attendance Open: ${lecture.name}`, { body: `Tap to mark presence.` }).onclick = () => {
                    setActiveLecture(lecture);
                    setView('scanQRCode');
                };
            }
        }
    };

    const handleAttendFromNotification = (lecture) => {
        if (lecture) { setActiveLecture(lecture); setView('scanQRCode'); }
        setLectureNotification(null);
    };

    const renderContent = () => {
        if (isLoading) return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-16 h-16 border-8 border-slate-100 border-t-[#4B1D6F] rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Loading......</p>
            </div>
        );

        if (user) {
            switch (view) {
                case 'adminHome': return <AdminDashboard user={user} token={token} setView={setView} initialTab="overview" />;
                case 'adminAnalytics': return <AdminDashboard user={user} token={token} setView={setView} initialTab="analytics" />;
                case 'adminUsers': return <AdminDashboard user={user} token={token} setView={setView} initialTab="users" />;
                case 'adminReports': return <AdminDashboard user={user} token={token} setView={setView} initialTab="attendance" />;
                case 'adminLeaves': return <AdminDashboard user={user} token={token} setView={setView} initialTab="leaves" />;
                case 'teacherHome': return <TeacherDashboard user={user} setView={setView} lectures={lectures} activeLecture={activeLecture} setActiveLecture={handleSetActiveLecture} token={token} allStudents={registeredStudents} />;
                case 'reports': return <AttendanceReportsPage setView={setView} lectures={lectures} attendanceRecords={attendanceRecords} allStudents={registeredStudents} teacherId={user.id} token={token} />;
                case 'createLecture': return <CreateLecturePage setView={setView} addLecture={addLecture} setActiveLecture={handleSetActiveLecture} />;
                case 'studentHome': return <StudentDashboard user={user} token={token} setView={setView} lectures={lectures} attendanceRecords={attendanceRecords} lectureNotification={lectureNotification} onAttendNow={handleAttendFromNotification} />;
                case 'scanQRCode': return <ScanQRCodePage setView={setView} markAttendance={markAttendance} lectures={lectures} token={token} user={user} />;
                case 'viewSchedule': return <ViewSchedulePage setView={setView} lectures={lectures} />;
                case 'studentProfile': return <StudentProfilePage setView={setView} user={user} token={token} />;
                default:
                    if (user.role === 'admin') setView('adminHome');
                    else setView(user.role === 'teacher' ? 'teacherHome' : 'studentHome');
                    return null;
            }
        }

        switch (view) {
            case 'teacherLogin': return <TeacherLoginPage setView={setView} onLogin={handleLogin} />;
            case 'teacherRegister': return <TeacherRegisterPage setView={setView} onRegister={handleRegister} />;
            case 'studentLogin': return <StudentLoginPage setView={setView} onLogin={handleLogin} />;
            case 'studentRegister': return <StudentRegisterPage setView={setView} onRegister={handleRegister} />;
            case 'adminLogin': return <AdminLoginPage setView={setView} onLogin={handleLogin} />;
            default: return <LandingPage setView={setView} />;
        }
    };

    return (
        <div className={`min-h-screen overflow-x-hidden selection:bg-[#4B1D6F] selection:text-white ${isDarkMode ? 'dark bg-slate-900' : 'bg-white'}`}>
            <Navbar user={user} setView={setView} onLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="page-transition-enter-active">
                {renderContent()}
            </div>
        </div>
    );
}