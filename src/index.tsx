import React from 'react';
import ReactDOM from 'react-dom/client';
import { AnimaProvider } from '@animaapp/playground-react-sdk';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

const AppWithProviders = (
  <React.StrictMode>
    <AnimaProvider>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </AnimaProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('app')!).render(AppWithProviders);
