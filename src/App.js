import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import PageLogin from './components/PageLogin';
import ResetPassword from './components/ResetPassword'; // Importar o componente de Resetar Senha
import { FirewallPage, ObjetosPage, EnviosPage, ConfiguracoesPage, AjudaPage } from './router';
import { AuthProvider } from './contexts/AuthContext';
import '../src/App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {isAuthenticated && <SideBar />} 
          <Routes>
            <Route path="/login" element={<PageLogin setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/firewall" element={isAuthenticated ? <FirewallPage /> : <Navigate to="/login" />} />
            <Route path="/objetos" element={isAuthenticated ? <ObjetosPage /> : <Navigate to="/login" />} />
            <Route path="/tarefas" element={isAuthenticated ? <EnviosPage /> : <Navigate to="/login" />} />
            <Route path="/configuracoes" element={isAuthenticated ? <ConfiguracoesPage /> : <Navigate to="/login" />} />
            <Route path="/ajuda" element={isAuthenticated ? <AjudaPage /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
