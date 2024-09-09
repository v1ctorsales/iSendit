// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [destinataria, setDestinataria] = useState(false);
    const [uuid, setUuid] = useState(null); // Certifique-se de que setUuid está definido
    const [empresaPai, setEmpresaPai] = useState(null); // Novo estado para armazenar empresaPai_uuid
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Verifica se o token existe no localStorage para definir o estado de autenticação
        const storedToken = localStorage.getItem('authToken');
        const storedDestinataria = localStorage.getItem('destinataria');
        const storedUuid = localStorage.getItem('uuid');
        const storedEmpresaPai = localStorage.getItem('empresaPai_uuid'); // Recupera empresaPai_uuid do localStorage

        if (storedToken && storedUuid && storedDestinataria) {
            setIsAuthenticated(true);
            setToken(storedToken);
            setUuid(storedUuid);
            setDestinataria(storedDestinataria === 'true'); // Converter string para boolean
            if (storedEmpresaPai) {
                setEmpresaPai(storedEmpresaPai); // Define empresaPai_uuid no estado
            }
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
                // Armazena os dados no estado do contexto
                setIsAuthenticated(true);
                setToken(data.token);
                setUuid(data.uuid);  // Aqui armazena o uuid
                setDestinataria(data.destinataria);
                setEmpresaPai(data.empresaPai_uuid); // Armazena o empresaPai_uuid

                // Salva os dados no localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('uuid', data.uuid); // Armazena uuid no localStorage
                localStorage.setItem('destinataria', data.destinataria);
                localStorage.setItem('empresaPai_uuid', data.empresaPai_uuid); // Armazena empresaPai_uuid no localStorage
    
                return { success: true, uuid: data.uuid, destinataria: data.destinataria, empresaPai: data.empresaPai_uuid }; // Retorna uuid e empresaPai_uuid
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
        setEmpresaPai(null);

        localStorage.removeItem('authToken');
        localStorage.removeItem('uuid');
        localStorage.removeItem('destinataria');
        localStorage.removeItem('empresaPai_uuid'); // Remove o empresaPai_uuid do localStorage
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                login,
                logout,
                destinataria,
                uuid, // Fornece uuid no contexto
                setUuid, // Fornece setUuid no contexto
                empresaPai, // Fornece empresaPai_uuid no contexto
                token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
