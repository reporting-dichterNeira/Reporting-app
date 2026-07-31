/* ==========================================================================
   COMPONENTE DE NOTIFICACIONES TOAST (TOAST.TSX)
   ========================================================================== */

import React from 'react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
    const { toasts } = useApp();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-wrapper">
            {toasts.map(t => (
                <div key={t.id} className={`toast-item ${t.type}`}>
                    <i data-lucide="info"></i>
                    <span>{t.text}</span>
                </div>
            ))}
        </div>
    );
};
