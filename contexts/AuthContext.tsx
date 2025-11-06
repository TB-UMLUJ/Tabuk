import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticating: boolean;
    verifyCredentials: (username: string, password: string) => Promise<User | null | 'INACTIVE_ACCOUNT'>;
    performLogin: (user: User) => void;
    changePassword: (userId: number, currentPassword: string, newPassword: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permissionName: string) => boolean;
    justLoggedIn: boolean;
    clearJustLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    const fetchUserPermissions = useCallback(async (roleId: number): Promise<string[]> => {
        const { data, error } = await supabase
            .from('role_permissions')
            .select('permissions(permission_name)')
            .eq('role_id', roleId);

        if (error) {
            console.error('Error fetching permissions:', error);
            return [];
        }
        return data.map((item: any) => item.permissions.permission_name);
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const sessionData = sessionStorage.getItem('currentUser');
                if (sessionData) {
                    const user = JSON.parse(sessionData);
                    // Re-validate and refresh permissions on load
                    const permissions = await fetchUserPermissions(user.role.role_id);
                    setCurrentUser({ ...user, permissions });
                }
            } catch (error) {
                console.error("Failed to parse user session", error);
                sessionStorage.removeItem('currentUser');
            } finally {
                setIsAuthenticating(false);
            }
        };

        checkSession();
    }, [fetchUserPermissions]);

    const verifyCredentials = async (username: string, password: string): Promise<User | null | 'INACTIVE_ACCOUNT'> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*, role:roles(*)')
                .eq('username', username)
                .eq('password', password) // NOTE: Plain text password check. NOT FOR PRODUCTION.
                .single();

            if (error || !data) {
                console.error('Login failed:', error?.message);
                return null;
            }
            
            if (!data.is_active) {
                return 'INACTIVE_ACCOUNT';
            }

            const permissions = await fetchUserPermissions(data.role.role_id);
            
            const user: User = {
                user_id: data.user_id,
                username: data.username,
                full_name: data.full_name,
                is_active: data.is_active,
                role: data.role,
                role_id: data.role_id,
                permissions,
            };
            
            return user;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const performLogin = (user: User) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setJustLoggedIn(true);
    };


    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        sessionStorage.setItem('logoutMessage', 'تم تسجيل خروجك بنجاح.');
    };

    const hasPermission = (permissionName: string): boolean => {
        return !!currentUser?.permissions.includes(permissionName);
    };
    
    const clearJustLoggedIn = () => {
        setJustLoggedIn(false);
    };

    const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
            // 1. Verify current password
            const { data: user, error: verifyError } = await supabase
                .from('users')
                .select('user_id')
                .eq('user_id', userId)
                .eq('password', currentPassword) // Plain text check
                .single();

            if (verifyError || !user) {
                console.error('Password verification failed:', verifyError);
                return false;
            }

            // 2. Update to new password
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: newPassword })
                .eq('user_id', userId);

            if (updateError) throw updateError;

            return true;
        } catch (error) {
            console.error('Error changing password:', error);
            return false;
        }
    };

    const value = {
        currentUser,
        isAuthenticating,
        verifyCredentials,
        performLogin,
        changePassword,
        logout,
        hasPermission,
        justLoggedIn,
        clearJustLoggedIn,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};