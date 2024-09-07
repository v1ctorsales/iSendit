// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [destinataria, setDestinataria] = useState(false);
    const [uuid, setUuid] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Verifica se o token existe no localStorage para definir o estado de autenticação
        const storedToken = localStorage.getItem('authToken');
        const storedDestinataria = localStorage.getItem('destinataria');
        const storedUuid = localStorage.getItem('uuid');

        if (storedToken && storedUuid) {
            setIsAuthenticated(true);
            setToken(storedToken);
            setUuid(storedUuid);
            setDestinataria(storedDestinataria === 'true'); // Converter string para boolean
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch('/api/verifyLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (data.success) {
                // Armazenar os dados no estado do contexto
                setIsAuthenticated(true);
                setToken(data.token);
                setUuid(data.uuid);
                setDestinataria(data.destinataria);

                // Salvar os dados no localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('uuid', data.uuid);
                localStorage.setItem('destinataria', data.destinataria.toString());

                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { success: false, message: 'Erro ao fazer login' };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setToken(null);
        setUuid(null);
        setDestinataria(false);

        localStorage.removeItem('authToken');
        localStorage.removeItem('uuid');
        localStorage.removeItem('destinataria');
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                login,
                logout,
                destinataria,
                uuid,
                token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
