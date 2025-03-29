import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BellIcon, MagnifyingGlassIcon, SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    time: string;
    read: boolean;
}

interface NavbarProps {
    onOpenSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications] = useState<Notification[]>([
        {
            id: 1,
            title: 'Servis Uyarısı',
            message: 'Nginx servisinde yüksek CPU kullanımı tespit edildi.',
            type: 'warning',
            time: '10 dk önce',
            read: false
        },
        {
            id: 2,
            title: 'Konteyner Başlatıldı',
            message: 'postgres-db konteynerı başarıyla başlatıldı.',
            type: 'success',
            time: '1 saat önce',
            read: false
        },
        {
            id: 3,
            title: 'Komut Tamamlandı',
            message: 'Sistem güncelleme komutu başarıyla çalıştırıldı.',
            type: 'info',
            time: '3 saat önce',
            read: true
        }
    ]);

    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    const toggleNotifications = () => {
        setIsNotificationsOpen(prev => !prev);
        if (isProfileOpen) setIsProfileOpen(false);
    };

    const toggleProfile = () => {
        setIsProfileOpen(prev => !prev);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
    };

    const getNotificationBadgeColor = (type: Notification['type']) => {
        switch (type) {
            case 'warning': return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300';
            case 'success': return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300';
            case 'error': return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300';
            default: return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300';
        }
    };

    const getBreadcrumbItems = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ name: 'Ana Sayfa', path: '/' }];
        let currentPath = '';
        pathSegments.forEach(segment => {
            currentPath += `/${segment}`;
            const formattedName = segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            breadcrumbs.push({ name: formattedName, path: currentPath });
        });
        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbItems();

    return (
        <nav className="h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-900 ">
            {/* Left: Hamburger & Breadcrumbs */}
            <div className="flex items-center space-x-3">
                <button
                    onClick={onOpenSidebar}
                    className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <Bars3Icon className="h-5 w-5" />
                </button>
                <nav className="hidden md:flex items-center space-x-2">
                    {breadcrumbs.map((item, index) => (
                        <div key={item.path} className="flex items-center">
                            {index > 0 && <span className="text-gray-400 mx-1">/</span>}
                            <Link
                                to={item.path}
                                className={`text-sm ${index === breadcrumbs.length - 1
                                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Servis, konteyner veya komut ara..."
                        className="w-full h-9 pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {theme === 'dark' ? (
                        <SunIcon className="w-5 h-5" />
                    ) : (
                        <MoonIcon className="w-5 h-5" />
                    )}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={toggleNotifications}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                    >
                        <BellIcon className="w-5 h-5" />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {unreadNotificationsCount}
                            </span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Bildirimler</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-3 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${n.read ? 'opacity-75' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getNotificationBadgeColor(n.type)}`}>
                                                {n.type === 'info' ? 'Bilgi' : n.type === 'warning' ? 'Uyarı' : n.type === 'success' ? 'Başarı' : 'Hata'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={toggleProfile}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                            {user?.name.charAt(0)}
                        </div>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                            </div>
                            <div className="py-1">
                                <Link to="/settings/profile" className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profilim
                                </Link>
                                <Link to="/settings" className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Ayarlar
                                </Link>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Çıkış Yap
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;