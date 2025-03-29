import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    fixed md:relative w-72 h-full bg-white dark:bg-gray-900 shadow-lg
                    z-40 md:z-0 transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800
                `}
            >
                <Sidebar closeSidebar={() => setSidebarOpen(false)} />
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <header className="z-10 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
                    <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
                </header>
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-950">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;