'use client'

import { set } from 'mongoose';
import React, { createContext, useContext, useState, useEffect, Children } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }

    return context;
}


export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true)

            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setIsAuthenticated(true);
            }
            else {
                setIsAuthenticated(false);
                setUser(null);
            }

        } catch (error) {
            console.error("Error checking authentication status:", error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }



    const login = async (credentials) => {
        try {
            setIsLoading(true)

            const response = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include'
            })

            const result = await response.json()

            if (result.success) {
                await checkAuthStatus()
                return { success: true }
            } else {
                return { success: false, error: result.error }
            }
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' }
        } finally {
            setIsLoading(false)
        }
    }


    const logout = async () => {
        try {
            setIsLoading(true)

            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            if (response.ok) {
                setUser(null)
                setIsAuthenticated(false)
                return { success: true }
            } else {
                return { success: false, error: 'Logout failed. Please try again.' }
            }
        } catch (error) {
            return { success: false, error: 'Logout failed. Please try again.' }
        } finally {
            setIsLoading(false)
        }
    }

    const refreshUser = async () => {
        checkAuthStatus()
    }

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        checkAuthStatus
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}