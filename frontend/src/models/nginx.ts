// NginxConfig represents an nginx configuration
export interface NginxConfig {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    name: string;
    domain?: string;
    serverName?: string;
    port: number;
    sslEnabled: boolean;
    certPath?: string;
    keyPath?: string;
    proxyPass?: string;
    rootPath?: string;
    configPath?: string; // Path to actual config file
    active: boolean;
    customConfig?: string; // Additional custom configuration
}
