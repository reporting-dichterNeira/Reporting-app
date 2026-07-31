/* ==========================================================================
   PANTALLA DE BIENVENIDA CON ANIMACIÓN DE LOGO D&N (SPLASHSCREEN.TSX)
   ========================================================================== */

import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setFadeOut(true);
        }, 1800);

        const timer2 = setTimeout(() => {
            setVisible(false);
        }, 2400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className={`splash-overlay ${fadeOut ? 'splash-fade-out' : ''}`}>
            <div className="splash-content">
                <div className="splash-logo-badge">
                    <span className="splash-dn-bold">D&N</span>
                </div>
                <h2 className="splash-title">Dichter & Neira</h2>
                <div className="splash-subtitle">Mesa de Reporting & Operaciones LatAm</div>
                <div className="splash-loader-bar">
                    <div className="splash-loader-fill"></div>
                </div>
            </div>
        </div>
    );
};
