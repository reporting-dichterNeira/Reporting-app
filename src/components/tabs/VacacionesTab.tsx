/* ==========================================================================
   PESTAÑA VACACIONES Y NOVEDADES ADMIN (VACACIONESTAB.TSX)
   ========================================================================== */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { colombianHolidays2026 } from '../../types';

export const VacacionesTab: React.FC = () => {
    const { analystStatus, submitNovedad, deleteNovedad, isReportingAuthenticated } = useApp();

    const [analyst, setAnalyst] = useState('Juliana Chimbi');
    const [status, setStatus] = useState('VACACIONES');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [note, setNote] = useState('');

    const activeLeaves = analystStatus.filter(a => a.status !== 'DISPONIBLE');
    const todayStr = new Date().toISOString().slice(0, 10);
    const futureHolidays = colombianHolidays2026.filter(h => h.iso >= todayStr);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitNovedad(analyst, status, dateStart, dateEnd, note);
        setDateStart('');
        setDateEnd('');
        setNote('');
    };

    return (
        <div className="tab-content active" id="tab-vacaciones">
            {/* Formulario de Administración de Ausencias */}
            {isReportingAuthenticated && (
                <div className="card-box" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h2><i data-lucide="plane-takeoff"></i> Programar Novedad o Vacaciones de Analista</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Analista del Equipo <span className="req">*</span></label>
                                <select value={analyst} onChange={e => setAnalyst(e.target.value)} required>
                                    <option value="Mayumi Sanchez">Mayumi Sanchez</option>
                                    <option value="Juliana Chimbi">Juliana Chimbi</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tipo de Ausencia <span className="req">*</span></label>
                                <select value={status} onChange={e => setStatus(e.target.value)} required>
                                    <option value="VACACIONES">🏖️ Vacaciones</option>
                                    <option value="DIA_LIBRE">🌴 Día Libre</option>
                                    <option value="CAPACITACION">📚 Capacitación / Taller</option>
                                    <option value="DISPONIBLE">🟢 Quitar Ausencia / Marcar Disponible</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha Inicio</label>
                                <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Fecha Fin</label>
                                <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Detalle o Nota de Respaldo <span className="req">*</span></label>
                            <textarea
                                rows={2}
                                placeholder="Ej: En periodo de vacaciones. Durante estos días Mayumi Sanchez estará atendiendo las solicitudes de Power BI."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-dn-primary">
                            <i data-lucide="save"></i> Publicar y Notificar Novedad
                        </button>
                    </form>
                </div>
            )}

            {/* Tabla de Vacaciones Programadas */}
            <div className="grid-2-cols">
                <div className="card-box">
                    <div className="card-header">
                        <h2><i data-lucide="calendar"></i> Vacaciones & Ausencias Programadas</h2>
                    </div>

                    <div className="table-responsive-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Analista</th>
                                    <th>Estado</th>
                                    <th>Periodo & Nota</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeLeaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                            No hay vacaciones o ausencias programadas actualmente.
                                            <br />
                                            <small style={{ color: 'var(--dn-green)', fontWeight: 700 }}>
                                                🟢 Ambas analistas (Mayumi Sanchez y Juliana Chimbi) están registradas como disponibles.
                                            </small>
                                        </td>
                                    </tr>
                                ) : (
                                    activeLeaves.map((item) => {
                                        const realIdx = analystStatus.findIndex(a => a === item);
                                        let badgeClass = 'vacaciones';
                                        let statusLabel = '🏖️ Vacaciones';
                                        if (item.status === 'DIA_LIBRE') {
                                            badgeClass = 'dia_libre';
                                            statusLabel = '🌴 Día Libre';
                                        } else if (item.status === 'CAPACITACION') {
                                            badgeClass = 'capacitacion';
                                            statusLabel = '📚 Capacitación';
                                        }

                                        return (
                                            <tr key={item.analyst}>
                                                <td><strong>{item.analyst}</strong></td>
                                                <td><span className={`status-badge ${badgeClass}`}>{statusLabel}</span></td>
                                                <td>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>{item.dates}</span>
                                                    <br />
                                                    <small style={{ color: 'var(--text-muted)' }}>{item.note}</small>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-danger btn-sm"
                                                        onClick={() => deleteNovedad(realIdx)}
                                                        title="Eliminar / Quitar Novedad"
                                                    >
                                                        <i data-lucide="trash-2"></i> Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Próximos Días Festivos Colombia */}
                <div className="card-box">
                    <div className="card-header">
                        <h2>🇨🇴 Próximos Festivos Oficiales Colombia 2026</h2>
                        <span className="badge-total-encoladas">{futureHolidays.length} días</span>
                    </div>

                    <div className="holidays-grid">
                        {futureHolidays.map(h => (
                            <div className="holiday-item" key={h.iso}>
                                <div className="holiday-date-box">
                                    <div className="holiday-day">{h.dateLabel}</div>
                                    <div className="holiday-month">{h.day}</div>
                                </div>
                                <div className="holiday-name">{h.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
