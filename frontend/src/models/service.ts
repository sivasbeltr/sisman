// Service represents a monitored system service
export interface Service {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    name: string;
    description?: string;
    type: string; // systemd, docker, etc.
    status: string; // running, stopped, etc.
    monitored: boolean;
    metrics: ServiceMetric[];
    config?: string; // Service configuration (JSON)
}

// ServiceMetric represents a point-in-time metric for a service
export interface ServiceMetric {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    serviceId: number;
    timestamp: number; // Unix timestamp
    cpuUsage: number; // Percentage
    memoryUsage: number; // MB
    diskUsage: number; // MB
    networkIn: number; // MB
    networkOut: number; // MB
    responseTime: number; // ms
    status: string; // running, stopped, error, etc.
}
