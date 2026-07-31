/* ==========================================================================
   PUNTO DE ENTRADA PRINCIPAL REACT (MAIN.TSX)
   ========================================================================== */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { AppContent } from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </React.StrictMode>
    );
}
