import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UuidProvider } from './contexts/UuidContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UuidProvider>
      <App />
    </UuidProvider>
  </React.StrictMode>
);