import React from 'react';
import ReactDOM from 'react-dom/client';
import { LocalSecureApp } from './presentation/components/LocalSecureApp';
import './presentation/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocalSecureApp />
  </React.StrictMode>
);
