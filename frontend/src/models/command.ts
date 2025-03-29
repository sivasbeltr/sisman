// Command represents a system command that can be executed
export interface Command {
    ID: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    name: string;
    description?: string;
    command: string;
    category?: string;
    enabled: boolean;
    parameters: CommandParameter[];
    executions: CommandExecution[];
}

// ParameterType represents the type of a command parameter
export type ParameterType =
    | "string"
    | "number"
    | "boolean"
    | "select"
    | "file";

// CommandParameter represents parameters for a command
export interface CommandParameter {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    commandId: number;
    name: string;
    label: string;
    type: ParameterType;
    required: boolean;
    defaultValue?: string;
    options?: string; // JSON string for select options
    validation?: string; // Regex or validation rules
    order: number;
}

// CommandExecution represents a record of command execution
export interface CommandExecution {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    commandId: number;
    userId: number;
    parameters: string; // JSON string of parameters
    status: string; // success, error, etc.
    result?: string; // Output of the command
    errorMessage?: string;
    duration: number; // Duration in milliseconds
    ipAddress?: string;
}
