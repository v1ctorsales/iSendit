import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import PageLogin from './components/PageLogin';
import { FirewallPage, ObjetosPage, EnviosPage, ConfiguracoesPage, AjudaPage, ResetPW, SignUp } from './router';
import { AuthContext } from './contexts/AuthContext'; // importa o contexto
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import '../src/App.css'

function App() {
  const { isAuthenticated } = React.useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <SideBar />}
        <Routes>
          <Route path="/login" element={<PageLogin />} />
          <Route path="/firewall" element={isAuthenticated ? <FirewallPage /> : <Navigate to="/login" />} />
          <Route path="/objetos" element={isAuthenticated ? <ObjetosPage /> : <Navigate to="/login" />} />
          <Route path="/tarefas" element={isAuthenticated ? <EnviosPage /> : <Navigate to="/login" />} />
          <Route path="/reset-password" element={<ResetPW />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/configuracoes" element={isAuthenticated ? <ConfiguracoesPage /> : <Navigate to="/login" />} />
          <Route path="/ajuda" element={isAuthenticated ? <AjudaPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
