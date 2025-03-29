import React, { JSX, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    ServerIcon,
    CommandLineIcon,
    CpuChipIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    CubeIcon,
    WindowIcon,
    UserGroupIcon,
    CloudIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
    closeSidebar: () => void;
}

interface NavigationItem {
    name: string;
    path: string;
    icon: JSX.Element;
}

interface NavigationGroup {
    id: string;
    groupName: string;
    icon: JSX.Element;
    items: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
    const location = useLocation();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'monitoring': true,
        'configuration': false,
        'administration': false
    });

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const navigationGroups: NavigationGroup[] = [
        {
            id: 'monitoring',
            groupName: "İzleme",
            icon: <ChartBarIcon className="w-5 h-5" />,
            items: [
                { name: 'Kontrol Paneli', path: '/', icon: <HomeIcon className="w-5 h-5" /> },
                { name: 'Servis İzleme', path: '/service', icon: <ServerIcon className="w-5 h-5" /> },
                { name: 'Docker Konteynerler', path: '/docker', icon: <CubeIcon className="w-5 h-5" /> },
            ]
        },
        {
            id: 'configuration',
            groupName: "Yapılandırma",
            icon: <Cog6ToothIcon className="w-5 h-5" />,
            items: [
                { name: 'Komut Merkezi', path: '/command', icon: <CommandLineIcon className="w-5 h-5" /> },
                { name: 'Nginx Ayarları', path: '/nginx', icon: <WindowIcon className="w-5 h-5" /> },
            ]
        },
        {
            id: 'administration',
            groupName: "Yönetim",
            icon: <UserGroupIcon className="w-5 h-5" />,
            items: [
                { name: 'Kullanıcılar', path: '/user', icon: <UserGroupIcon className="w-5 h-5" /> },
                { name: 'Sistem Ayarları', path: '/settings', icon: <CpuChipIcon className="w-5 h-5" /> },
            ]
        }
    ];

    const isGroupActive = (group: NavigationGroup) => group.items.some(item => location.pathname === item.path);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                <Link to="/" className="flex items-center space-x-2">
                    <CloudIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-semibold tracking-tight">ŞİŞMAN</span>
                </Link>
                <button
                    onClick={closeSidebar}
                    className="md:hidden p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-2">
                {navigationGroups.map((group) => (
                    <div key={group.id}>
                        <button
                            onClick={() => toggleGroup(group.id)}
                            className={`
                                flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg
                                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                                ${isGroupActive(group) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                            `}
                        >
                            <span className="flex items-center space-x-2">
                                {group.icon}
                                <span>{group.groupName}</span>
                            </span>
                            <svg
                                className={`w-4 h-4 transition-transform duration-300 ${expandedGroups[group.id] ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div
                            className={`
                                mt-1 space-y-1 transition-all duration-300 ease-in-out
                                ${expandedGroups[group.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
                            `}
                        >
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`
                                            flex items-center px-4 py-2 text-sm rounded-lg transition-colors
                                            ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                                        `}
                                        onClick={() => window.innerWidth < 768 && closeSidebar()}
                                    >
                                        <span className="flex items-center space-x-3">
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                <p>SİSMAN v1.0</p>
                <p className="mt-1">© {new Date().getFullYear()} Sistem Yönetimi</p>
            </div>
        </div>
    );
};

export default Sidebar;