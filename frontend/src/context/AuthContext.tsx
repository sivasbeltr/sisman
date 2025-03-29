import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuthState: () => void;
}

interface User {
    id: string;
    username: string;
    role: string;
    name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Auto authenticate user
        autoLogin();
    }, []);

    // Auto login function to skip login page
    const autoLogin = async () => {
        setIsLoggedIn(true);
        setUser({
            id: '1',
            username: 'admin',
            role: 'admin',
            name: 'Demo User'
        });
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify({
            id: '1',
            username: 'admin',
            role: 'admin',
            name: 'Demo User'
        }));
    };

    const checkAuthState = () => {
        const storedLoginStatus = localStorage.getItem('isLoggedIn');
        const storedUser = localStorage.getItem('user');

        if (storedLoginStatus && storedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));
        } else {
            // Auto login if no stored state
            autoLogin();
        }
    };

    const login = async (username: string) => {
        // For demo purposes, accept any credentials
        setIsLoggedIn(true);
        const userData = {
            id: '1',
            username: username,
            role: 'admin',
            name: 'Demo User'
        };
        setUser(userData);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, checkAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
