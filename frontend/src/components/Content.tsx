import React, { useState, useEffect } from 'react';
import {
    ServerIcon,
    CubeIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface StatusCardProps {
    title: string;
    count: number;
    icon: React.JSX.Element;
    color: string;
}

interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, count, icon, color }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{title}</h3>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">{count}</p>
                </div>
                <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')} ${color.replace('border-', 'text-')}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const Content: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 0, memory: 0, disk: 0 });

    useEffect(() => {
        // Simüle edilmiş veri yükleme
        const timer = setTimeout(() => {
            setMetrics({
                cpu: 45,
                memory: 68,
                disk: 32
            });
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Kontrol Paneli</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Sistem servisleri ve konteynerlerinin genel durumuna genel bakış.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatusCard
                            title="Çalışan Servisler"
                            count={14}
                            icon={<ServerIcon className="h-6 w-6" />}
                            color="border-green-600"
                        />
                        <StatusCard
                            title="Aktif Konteynerler"
                            count={8}
                            icon={<CubeIcon className="h-6 w-6" />}
                            color="border-blue-600"
                        />
                        <StatusCard
                            title="Uyarı Durumunda"
                            count={2}
                            icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                            color="border-yellow-600"
                        />
                        <StatusCard
                            title="Sorunsuz Nginx"
                            count={3}
                            icon={<CheckCircleIcon className="h-6 w-6" />}
                            color="border-teal-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">CPU Kullanımı</h3>
                            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full ${metrics.cpu > 80 ? 'bg-red-500' : metrics.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${metrics.cpu}%` }}
                                ></div>
                            </div>
                            <div className="mt-1 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                                {metrics.cpu}%
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Bellek Kullanımı</h3>
                            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full ${metrics.memory > 80 ? 'bg-red-500' : metrics.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${metrics.memory}%` }}
                                ></div>
                            </div>
                            <div className="mt-1 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                                {metrics.memory}%
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Disk Kullanımı</h3>
                            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full ${metrics.disk > 80 ? 'bg-red-500' : metrics.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${metrics.disk}%` }}
                                ></div>
                            </div>
                            <div className="mt-1 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                                {metrics.disk}%
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Son İşlemler</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlem</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Servis</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Zaman</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Servis Yeniden Başlatma</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                                Başarılı
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">nginx</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">5 dk önce</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Konteyner Başlatma</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                                Başarılı
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">postgres-db</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">15 dk önce</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Komut Çalıştırma</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                                                Uyarı
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">sistem-güncelleme</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">45 dk önce</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Content;
