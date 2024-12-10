// src/components/ui/dropdown-menu.jsx
import React, { useState } from 'react';
import './css/dropdown-menu.css';

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="dropdown-menu">
      <div onClick={toggleMenu}>
        {children[0]}
      </div>
      {isOpen && (
        <div className="dropdown-menu-content" onClick={closeMenu}>
          {children[1]}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuContent({ children }) {
  return <div className="dropdown-menu-content">{children}</div>;
}

export function DropdownMenuTrigger({ children }) {
  return <div className="dropdown-menu-trigger">{children}</div>;
}

export function DropdownMenuRadioGroup({ value, onValueChange, children }) {
  return (
    <div className="dropdown-menu-radio-group">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isSelected: child.props.value === value,
          onClick: () => onValueChange(child.props.value),
        })
      )}
    </div>
  );
}

export function DropdownMenuRadioItem({ children, isSelected, onClick }) {
  return (
    <div
      className={`dropdown-menu-radio-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}