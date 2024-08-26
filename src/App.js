// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SideBar from './components/SideBar';
import { FirewallPage, ObjetosPage, EnviosPage, ConfiguracoesPage, AjudaPage } from './router.jsx';
import PageTransition from './components/PageTransition';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <SideBar />
        <Content />
      </div>
    </Router>
  );
}

function Content() {
  const location = useLocation();
  const [showPage, setShowPage] = useState(false);
  const [animationState, setAnimationState] = useState('page-enter');

  useEffect(() => {
    setAnimationState('page-enter');
    const timer = setTimeout(() => {
      setAnimationState('page-enter-active');
    }, 0); // Start the animation immediately
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="content">
      <PageTransition className={animationState}>
        <Routes location={location}>
          <Route path="/" element={<FirewallPage />} />
          <Route path="/objetos" element={<ObjetosPage />} />
          <Route path="/envios" element={<EnviosPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/ajuda" element={<AjudaPage />} />
        </Routes>
      </PageTransition>
    </div>
  );
}

export default App;
