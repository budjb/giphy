import React from 'react';
import './AlertBox.css';

export const Notice = ({ children }) => {
  return AlertBox({ type: 'notice', children });
};

export const AlertBox = ({ type, children }) => {
  return (
    <div className={`alert-box ${type}`}>
      <span className="label">notice: </span>
      {children}
    </div>
  );
};
