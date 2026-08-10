import React from 'react';
import ReactDOM from 'react-dom/client';
import { VeggieWorldApp } from './presentation/components/VeggieWorldApp';
import './presentation/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VeggieWorldApp />
  </React.StrictMode>
);
