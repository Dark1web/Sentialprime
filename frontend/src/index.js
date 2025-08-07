import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './utils/transition';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <div data-barba="wrapper">
        <App />
      </div>
    </Router>
  </React.StrictMode>
);

const style = document.createElement('style');
style.innerHTML = `
  .page-transition {
    position: fixed;
    width: 100%;
    height: 100%;
    top: -100%;
    left: 0;
    background-color: #000;
    z-index: 9999;
  }
`;
document.head.appendChild(style);