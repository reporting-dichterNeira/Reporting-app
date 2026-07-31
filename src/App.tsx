/* ==========================================================================
   COMPONENTE PRINCIPAL (APP.TSX)
   ========================================================================== */

import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { TodayAlertBanner } from './components/TodayAlertBanner';
import { ToastContainer } from './components/Toast';

import { AuthModal } from './components/modals/AuthModal';
import { ManageModal } from './components/modals/ManageModal';
import { EmailPreviewModal } from './components/modals/EmailPreviewModal';

import { EncoladasTab } from './components/tabs/EncoladasTab';
import { ReportingTab } from './components/tabs/ReportingTab';
import { AdminTab } from './components/tabs/AdminTab';
import { VacacionesTab } from './components/tabs/VacacionesTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';

export const AppContent: React.FC = () => {
    const { activeTab, analystStatus } = useApp();

    useEffect(() => {
        const win = window as any;
        if (win.lucide) {
            win.lucide.createIcons();
        }
    });

    return (
        <div className="app-layout">
            <SplashScreen />
            <Header />

            <main className="app-main-content">
                <TodayAlertBanner />

                {activeTab === 'encoladas' && <EncoladasTab />}
                {activeTab === 'reporting' && <ReportingTab />}
                {activeTab === 'admin' && <AdminTab />}
                {activeTab === 'vacaciones' && <VacacionesTab />}
                {activeTab === 'analytics' && <AnalyticsTab />}

                {activeTab === 'novedades' && (
                    <div className="tab-content active">
                        <div className="grid-2-cols">
                            <div className="card-box">
                                <div className="card-header">
                                    <h2><i data-lucide="users"></i> Disponibilidad del Equipo de Reporting</h2>
                                </div>

                                <div className="analyst-status-list">
                                    {['Mayumi Sanchez', 'Juliana Chimbi'].map(analystName => {
                                        const item = analystStatus.find(a => a.analyst === analystName && a.status !== 'DISPONIBLE');
                                        if (item) {
                                            return (
                                                <div className="analyst-status-card on-leave" key={analystName}>
                                                    <div className="analyst-card-top">
                                                        <span className="analyst-name-bold">
                                                            <i data-lucide="user-check"></i> {item.analyst}
                                                        </span>
                                                        <span className="status-badge vacaciones">🏖️ En Vacaciones</span>
                                                    </div>
                                                    <div className="analyst-note-text">{item.note}</div>
                                                    {item.dates && <div className="analyst-dates-sub">📅 {item.dates}</div>}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="analyst-status-card available" key={analystName}>
                                                    <div className="analyst-card-top">
                                                        <span className="analyst-name-bold">
                                                            <i data-lucide="user-check"></i> {analystName}
                                                        </span>
                                                        <span className="status-badge available">🟢 Disponible</span>
                                                    </div>
                                                    <div className="analyst-note-text">🟢 Laborando en horario regular. Atendiendo solicitudes de Power BI y Encoladas.</div>
                                                    <div className="analyst-dates-sub">📅 Disponible todo el periodo</div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>

                            <div className="card-box">
                                <div className="colombia-info-card" style={{ padding: '16px', borderRadius: '12px' }}>
                                    <div className="colombia-badge">
                                        <span className="flag-icon">🇨🇴</span> Colombia (Zona Horaria GMT-5)
                                    </div>
                                    <h2>Compromiso de Atención Dichter & Neira</h2>
                                    <p className="colombia-info-text">
                                        El equipo de Reporting opera desde Colombia. Las solicitudes de encoladas se revisan en un plazo máximo de <strong>2 días hábiles</strong> y las solicitudes de Power BI en un plazo máximo de <strong>3 días hábiles</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AuthModal />
            <ManageModal />
            <EmailPreviewModal />
            <ToastContainer />
        </div>
    );
};
