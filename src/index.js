import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UuidProvider } from './contexts/UuidContext';
import { AuthProvider } from './contexts/AuthContext'; // ✅ importa o AuthProvider também

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ envolve com AuthProvider */}
      <UuidProvider> {/* ✅ mantém o UuidProvider também */}
        <App />
      </UuidProvider>
    </AuthProvider>
  </React.StrictMode>
);
