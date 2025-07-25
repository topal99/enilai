"use client";

import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
    const { user, logout, activeSemester} = useAuth();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Siswa Dashboard</h1>
            {activeSemester && (
                <span className="text-lg font-semibold text-gray-600 bg-gray-200 px-4 py-2 rounded-lg">
                Semester Aktif: {activeSemester}
                </span>
            )}
        </div>
            <h1 className="text-2xl font-bold">Selamat Datang, {user?.name}!</h1>
            <p>Anda login sebagai: <strong>{user?.role?.name}</strong></p>
            <p>Email Anda: {user?.email}</p>
            <button 
                onClick={logout}
                className="px-4 py-2 mt-4 font-bold text-white bg-red-500 rounded hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
}