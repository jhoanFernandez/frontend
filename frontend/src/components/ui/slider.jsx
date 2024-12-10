// src/components/ui/slider.jsx
import React from 'react';
import './css/slider.css';

export function Slider({ value, onValueChange, min, max, step, className }) {
  const handleChange = (event) => {
    onValueChange([Number(event.target.value)]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      className={`slider ${className}`}
    />
  );
}