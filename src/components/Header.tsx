/* ==========================================================================
   EN CABEZADO DE LA APLICACIÓN (HEADER.TSX)
   ========================================================================== */

import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
    const {
        isReportingAuthenticated,
        activeTab,
        setActiveTab,
        logoutReporting,
        openModal,
        requests,
        isCloudOnline
    } = useApp();

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

    return (
        <header className="app-header">
            <div className="logo-container">
                <div className="dn-logo-badge">
                    <span className="dn-bold">D&N</span>
                </div>
                <div className="logo-text">
                    <div className="logo-title">
                        Dichter & Neira
                        <span className="badge-tag">Portal de Operaciones</span>
                    </div>
                    <div className="logo-subtitle">Gestión de Encoladas PDV & Mesa de Reporting Power BI</div>
                </div>
            </div>

            <nav className="main-nav">
                <button
                    className={`nav-tab ${activeTab === 'encoladas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('encoladas')}
                >
                    <i data-lucide="database"></i> Encoladas PDV
                </button>
                <button
                    className={`nav-tab ${activeTab === 'reporting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reporting')}
                >
                    <i data-lucide="bar-chart-3"></i> Solicitudes Reporting
                </button>
                <button
                    className={`nav-tab ${activeTab === 'novedades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('novedades')}
                >
                    <i data-lucide="calendar"></i> Novedades & Festivos
                </button>

                {isReportingAuthenticated && (
                    <>
                        <button
                            className={`nav-tab admin-tab ${activeTab === 'admin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('admin')}
                        >
                            <i data-lucide="shield-check"></i> Mesa de Reporting
                            {pendingCount > 0 && <span className="counter-badge">{pendingCount}</span>}
                        </button>
                        <button
                            className={`nav-tab admin-tab ${activeTab === 'vacaciones' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vacaciones')}
                        >
                            <i data-lucide="plane"></i> Vacaciones Admin
                        </button>
                        <button
                            className={`nav-tab analytics-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <i data-lucide="line-chart"></i> Tiempos & KPIs
                        </button>
                    </>
                )}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                    id="cloud-sync-status"
                    className={`sync-badge-status ${isCloudOnline ? 'online' : 'offline'}`}
                >
                    {isCloudOnline ? (
                        <><span className="sync-dot-pulse"></span> Nube Conectada</>
                    ) : (
                        <>⚠️ Modo Local</>
                    )}
                </div>

                {!isReportingAuthenticated ? (
                    <button
                        className="btn-dn-accent"
                        onClick={() => openModal('AUTH_MODAL')}
                    >
                        <i data-lucide="lock"></i> Acceso Reporting
                    </button>
                ) : (
                    <button
                        className="btn-danger btn-sm"
                        onClick={logoutReporting}
                    >
                        <i data-lucide="log-out"></i> Salir (Reporting)
                    </button>
                )}
            </div>
        </header>
    );
};
