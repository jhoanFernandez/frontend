// src/components/ui/popover.jsx
import React from 'react';
import './css/popover.css';

export function Popover({ children }) {
  return <div className="popover">{children}</div>;
}

export function PopoverContent({ children }) {
  return <div className="popover-content">{children}</div>;
}

export function PopoverTrigger({ children }) {
  return <div className="popover-trigger">{children}</div>;
}