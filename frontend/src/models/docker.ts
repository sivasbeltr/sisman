// DockerContainer represents a Docker container
export interface DockerContainer {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    containerId: string;
    name?: string;
    image?: string;
    status?: string;
    created: number;
    ports?: string; // JSON string of port mappings
    networks?: string; // JSON string of networks
    volumes?: string; // JSON string of volumes
    environment?: string; // JSON string of environment variables
    restartPolicy?: string;
    monitored: boolean;
    labels?: string; // JSON string of container labels
}
