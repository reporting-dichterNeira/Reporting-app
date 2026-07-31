/* ==========================================================================
   MODAL VISTA PREVIA DE NOTIFICACIÓN POR CORREO (EMAILPREVIEWMODAL.TSX)
   ========================================================================== */

import React from 'react';
import { useApp } from '../../context/AppContext';

export const EmailPreviewModal: React.FC = () => {
    const { emailPreviewModal, closeEmailPreviewModal } = useApp();

    if (!emailPreviewModal.isOpen) return null;

    return (
        <div className="modal-backdrop active">
            <div className="modal-box" style={{ maxWidth: '640px' }}>
                <div className="modal-header">
                    <h3><i data-lucide="mail"></i> Notificación Enviada por Correo</h3>
                    <button className="close-btn" onClick={closeEmailPreviewModal}>&times;</button>
                </div>

                <div className="email-mock-container">
                    <div className="email-mock-header">
                        <div><strong>Para:</strong> {emailPreviewModal.toEmail}</div>
                        <div><strong>Asunto:</strong> {emailPreviewModal.subject}</div>
                    </div>
                    <div
                        className="email-mock-body"
                        dangerouslySetInnerHTML={{ __html: emailPreviewModal.htmlBody }}
                    />
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-dn-primary" onClick={closeEmailPreviewModal}>
                        <i data-lucide="check"></i> Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};
