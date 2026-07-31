/* ==========================================================================
   MODAL DE AUTENTICACIÓN ADMIN DE REPORTING (AUTHMODAL.TSX)
   ========================================================================== */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
    const { activeModalId, closeModal, loginReporting } = useApp();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    if (activeModalId !== 'AUTH_MODAL') return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = loginReporting(username, password);
        if (success) {
            setUsername('');
            setPassword('');
        }
    };

    return (
        <div className="modal-backdrop active">
            <div className="modal-box">
                <div className="modal-header">
                    <h3><i data-lucide="shield-check"></i> Acceso Mesa de Reporting</h3>
                    <button className="close-btn" onClick={closeModal}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Ingresa con las credenciales oficiales de analista para gestionar tickets, ausencias y analítica.
                    </p>
                    <div className="form-group">
                        <label>Usuario</label>
                        <div className="input-with-icon">
                            <i data-lucide="user"></i>
                            <input
                                type="text"
                                placeholder="Ej: reporting"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <div className="input-with-icon">
                            <i data-lucide="key"></i>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                        <button type="submit" className="btn-dn-primary">
                            <i data-lucide="log-in"></i> Iniciar Sesión Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
