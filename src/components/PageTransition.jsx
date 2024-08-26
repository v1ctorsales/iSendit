// PageTransition.js
import React from 'react';
import '../App.css' // Certifique-se de que o caminho está correto

function PageTransition({ children, className }) {
    return (
      <div className={`page-transition ${className}`}>
        {children}
      </div>
    );
  }
  
  export default PageTransition;