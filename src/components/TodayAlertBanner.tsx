/* ==========================================================================
   BANNER DE NOVEDADES Y FESTIVOS DEL DÍA (TODAYALERTBANNER.TSX)
   ========================================================================== */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { colombianHolidays2026 } from '../types';

export const TodayAlertBanner: React.FC = () => {
    const { analystStatus } = useApp();
    const [closed, setClosed] = useState(false);

    if (closed) return null;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayHoliday = colombianHolidays2026.find(h => h.iso === todayStr);

    const absentAnalyst = analystStatus.find(a => {
        if (a.status !== 'VACACIONES' && a.status !== 'DIA_LIBRE') return false;
        if (a.dateStart && a.dateEnd) {
            return todayStr >= a.dateStart && todayStr <= a.dateEnd;
        }
        return false;
    });

    if (todayHoliday) {
        return (
            <div className="today-alert-banner">
                <div className="today-banner-content">
                    <div className="today-banner-icon">
                        <i data-lucide="calendar-off"></i>
                    </div>
                    <div>
                        <h4>🇨🇴 ¡Hoy es Día Festivo en Colombia: {todayHoliday.name}!</h4>
                        <p>El equipo de Reporting se encuentra en día no laborable. Las solicitudes ingresadas hoy serán atendidas a primera hora del próximo día hábil.</p>
                    </div>
                </div>
                <button className="today-banner-close" onClick={() => setClosed(true)}>&times;</button>
            </div>
        );
    }

    if (absentAnalyst) {
        return (
            <div className="today-alert-banner">
                <div className="today-banner-content">
                    <div className="today-banner-icon">
                        <i data-lucide="plane"></i>
                    </div>
                    <div>
                        <h4>📢 Novedad de Analista: {absentAnalyst.analyst}</h4>
                        <p>{absentAnalyst.note} ({absentAnalyst.dates})</p>
                    </div>
                </div>
                <button className="today-banner-close" onClick={() => setClosed(true)}>&times;</button>
            </div>
        );
    }

    return null;
};
