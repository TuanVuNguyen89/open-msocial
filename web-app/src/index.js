import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Polyfill để xử lý lỗi ResizeObserver
// Ngăn chặn lỗi "ResizeObserver loop completed with undelivered notifications"
const originalError = window.console.error;
window.console.error = (...args) => {
  if (args[0]?.includes?.('ResizeObserver loop') || 
      args[0]?.message?.includes?.('ResizeObserver loop')) {
    // Bỏ qua lỗi ResizeObserver
    return;
  }
  originalError(...args);
};

// Thêm global error handler
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver')) {
    event.stopImmediatePropagation();
    event.preventDefault();
    return true;
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
