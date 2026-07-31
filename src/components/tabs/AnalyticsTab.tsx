/* ==========================================================================
   PESTAÑA DE TIEMPOS DE RESPUESTA Y KPIS ANALYTICS (ANALYTICSTAB.TSX)
   ========================================================================== */

import React from 'react';
import { useApp } from '../../context/AppContext';

export const AnalyticsTab: React.FC = () => {
    const { requests } = useApp();

    const calcAvgHours = (analystName: string) => {
        const resolved = requests.filter(r => r.analyst === analystName && r.status === 'RESOLVED' && r.createdAt && r.resolvedAt);
        if (resolved.length === 0) return { avgHours: 0, count: 0 };
        let total = 0;
        resolved.forEach(r => {
            const diff = (new Date(r.resolvedAt!).getTime() - new Date(r.createdAt).getTime()) / (1000 * 3600);
            total += diff;
        });
        return { avgHours: Math.round((total / resolved.length) * 10) / 10, count: resolved.length };
    };

    const mayumiMetrics = calcAvgHours('Mayumi Sanchez');
    const julianaMetrics = calcAvgHours('Juliana Chimbi');

    const total = requests.length;
    const resolvedCount = requests.filter(r => r.status === 'RESOLVED').length;
    const rate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

    return (
        <div className="tab-content active" id="tab-analytics">
            {/* Tarjetas KPI Superior */}
            <div className="kpi-grid">
                <div className="kpi-card purple">
                    <div className="kpi-title">Mayumi Sanchez (Tiempo Promedio)</div>
                    <h3>{mayumiMetrics.count > 0 ? `~${mayumiMetrics.avgHours} hrs` : '--'}</h3>
                    <small>{mayumiMetrics.count} solicitudes resueltas</small>
                </div>
                <div className="kpi-card purple">
                    <div className="kpi-title">Juliana Chimbi (Tiempo Promedio)</div>
                    <h3>{julianaMetrics.count > 0 ? `~${julianaMetrics.avgHours} hrs` : '--'}</h3>
                    <small>{julianaMetrics.count} solicitudes resueltas</small>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-title">Tasa de Resolución Global</div>
                    <h3>{rate}%</h3>
                    <small>{resolvedCount} resueltas de {total} totales</small>
                </div>
            </div>

            {/* Resumen por Categoría */}
            <div className="card-box" style={{ marginTop: '20px' }}>
                <div className="card-header">
                    <h2><i data-lucide="bar-chart-2"></i> Distribución de Carga de Trabajo</h2>
                </div>

                <div className="grid-2-cols">
                    <div>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.92rem', color: 'var(--dn-navy-secondary)' }}>
                            Solicitudes por Analista Asignada
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div className="breakdown-item">
                                <span>Mayumi Sanchez</span>
                                <span className="breakdown-count">{requests.filter(r => r.analyst === 'Mayumi Sanchez').length}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Juliana Chimbi</span>
                                <span className="breakdown-count">{requests.filter(r => r.analyst === 'Juliana Chimbi').length}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Sin Asignar</span>
                                <span className="breakdown-count">{requests.filter(r => !r.analyst).length}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.92rem', color: 'var(--dn-navy-secondary)' }}>
                            Solicitudes por Categoría
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div className="breakdown-item">
                                <span>Encoladas PDV</span>
                                <span className="breakdown-count">{requests.filter(r => r.category === 'ENCOLADA').length}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Power BI Existente</span>
                                <span className="breakdown-count">{requests.filter(r => r.category === 'BI_EXISTING').length}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Power BI Nuevo</span>
                                <span className="breakdown-count">{requests.filter(r => r.category === 'BI_NEW').length}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Esporádicas</span>
                                <span className="breakdown-count">{requests.filter(r => r.category === 'BI_SPORADIC').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
