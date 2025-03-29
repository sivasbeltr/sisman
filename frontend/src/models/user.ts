// User represents a system user
export interface User {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    username: string;
    passwordHash: string;
    email: string;
    firstName?: string;
    lastName?: string;
    active: boolean;
    roles: Role[];
    activities: Activity[];
}

// Role represents a user role for authorization
export interface Role {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    name: string;
    description?: string;
    users: User[];
}

// Activity represents user activity logs
export interface Activity {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    userId: number;
    activityType: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
}
