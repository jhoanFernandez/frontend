// src/components/ui/button.jsx
import React from 'react';
import './css/button.css';

export function Button({ children, onClick, variant = 'default' }) {
  return (
    <button className={`button ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}