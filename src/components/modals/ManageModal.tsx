/* ==========================================================================
   MODAL DE GESTIÓN DE TICKETS Y ESTADOS (MANAGEMODAL.TSX)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { isImageFilename, dataURLtoBlob, triggerBlobDownload, generateFallbackImageBlob } from '../../services/fileService';
import { buildInProgressEmailData, buildResolutionEmailData, triggerEmailJsSend } from '../../services/emailService';

export const ManageModal: React.FC = () => {
    const {
        activeModalId,
        closeModal,
        requests,
        saveModalResponse,
        showToast,
        openEmailPreviewModal
    } = useApp();

    const req = requests.find(r => r.id === activeModalId);

    const [analyst, setAnalyst] = useState('');
    const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('PENDING');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [inProgressNote, setInProgressNote] = useState('');
    const [ticketNumber, setTicketNumber] = useState('');
    const [resolutionNote, setResolutionNote] = useState('');

    useEffect(() => {
        if (req) {
            setAnalyst(req.analyst || '');
            setStatus(req.status || 'PENDING');
            setDeliveryDate(req.deliveryDate || '');
            setInProgressNote(req.inProgressNote || '');
            setTicketNumber(req.ticketNumber || '');
            setResolutionNote(req.resolutionNote || '');
        }
    }, [req]);

    if (!activeModalId || activeModalId === 'AUTH_MODAL' || !req) return null;

    const handleAutoTicket = () => {
        const ticket = 'TCK-DN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        setTicketNumber(ticket);
    };

    const handleDownloadAttachment = () => {
        if (!req.fileName) return;
        const isImage = isImageFilename(req.fileName);

        if (isImage) {
            if (req.fileDataUrl && req.fileDataUrl.startsWith('data:')) {
                const blob = dataURLtoBlob(req.fileDataUrl);
                if (blob) {
                    triggerBlobDownload(blob, req.fileName);
                    showToast(`Descargando imagen: ${req.fileName}`, 'success');
                    return;
                }
            }
            generateFallbackImageBlob(req, blob => {
                const outName = req.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) ? req.fileName : req.fileName + '.png';
                triggerBlobDownload(blob, outName);
                showToast(`Descargando imagen: ${outName}`, 'success');
            });
        } else {
            showToast(`📧 El archivo "${req.fileName}" fue adjuntado y enviado directamente en la notificación por correo.`, 'info');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!analyst) {
            showToast('Debes seleccionar la analista asignada (Mayumi Sanchez o Juliana Chimbi)', 'warning');
            return;
        }

        if (status === 'IN_PROGRESS' && !deliveryDate) {
            showToast('Debes ingresar la fecha acordada de entrega', 'warning');
            return;
        }

        if (status === 'RESOLVED' && !ticketNumber) {
            showToast('Debes ingresar un número de ticket', 'warning');
            return;
        }

        const updatedReq = {
            ...req,
            analyst,
            status,
            deliveryDate,
            inProgressNote,
            ticketNumber,
            resolutionNote
        };

        saveModalResponse(req.id, analyst, status, deliveryDate, inProgressNote, ticketNumber, resolutionNote);

        if (status === 'IN_PROGRESS') {
            const emailData = buildInProgressEmailData(updatedReq);
            openEmailPreviewModal(emailData.recipientsStr, emailData.subject, emailData.htmlBody);
            triggerEmailJsSend(emailData, updatedReq);
        } else if (status === 'RESOLVED') {
            const emailData = buildResolutionEmailData(updatedReq);
            openEmailPreviewModal(emailData.recipientsStr, emailData.subject, emailData.htmlBody);
            triggerEmailJsSend(emailData, updatedReq);
        }
    };

    const isImage = isImageFilename(req.fileName);

    return (
        <div className="modal-backdrop active">
            <div className="modal-box">
                <div className="modal-header">
                    <h3><i data-lucide="edit-3"></i> Gestionar Solicitud {req.id}</h3>
                    <button className="close-btn" onClick={closeModal}>&times;</button>
                </div>

                <div className="summary-card" style={{ marginBottom: '16px' }}>
                    <div><strong>Categoría:</strong> {req.category}</div>
                    <div><strong>Solicitante:</strong> <span className="highlight-email">{req.email || req.solicitante}</span></div>
                    <div><strong>Estudio:</strong> {req.estudio} | <strong>País:</strong> {req.pais}</div>
                    <div><strong>Modalidad / PDVs:</strong> {req.pdvCode || 'Encolada'}</div>
                    {req.fileName && (
                        <div style={{ marginTop: '6px' }}>
                            <strong>Archivo Adjunto:</strong>{' '}
                            {isImage ? (
                                <button
                                    type="button"
                                    className="file-attached-chip clickable"
                                    onClick={handleDownloadAttachment}
                                >
                                    <i data-lucide="image"></i> 🖼️ {req.fileName} (Descargar)
                                </button>
                            ) : (
                                <span
                                    className="file-attached-chip email-badge"
                                    onClick={handleDownloadAttachment}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i data-lucide="mail-check"></i> 📎 {req.fileName} (Adjuntado al correo)
                                </span>
                            )}
                        </div>
                    )}
                    <div style={{ marginTop: '4px' }}><strong>Detalle:</strong> "{req.detalle}"</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Analista Asignada <span className="req">*</span></label>
                            <select
                                value={analyst}
                                onChange={e => setAnalyst(e.target.value)}
                                required
                            >
                                <option value="">-- Seleccionar --</option>
                                <option value="Mayumi Sanchez">Mayumi Sanchez</option>
                                <option value="Juliana Chimbi">Juliana Chimbi</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Estado de la Solicitud <span className="req">*</span></label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as any)}
                                required
                            >
                                <option value="PENDING">🟠 Pendiente</option>
                                <option value="IN_PROGRESS">🔵 En Proceso</option>
                                <option value="RESOLVED">🟢 Resuelto / Ticket Asignado</option>
                            </select>
                        </div>
                    </div>

                    {status === 'IN_PROGRESS' && (
                        <div style={{ background: 'rgba(51,189,238,0.1)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label>Fecha Acordada de Entrega <span className="req">*</span></label>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={e => setDeliveryDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Detalles del Acuerdo / Nota de Proceso</label>
                                <textarea
                                    rows={2}
                                    placeholder="Ej: Según la conversación con el solicitante, se entregarán los datos el 5 de Agosto."
                                    value={inProgressNote}
                                    onChange={e => setInProgressNote(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'RESOLVED' && (
                        <div style={{ background: 'rgba(20,168,59,0.1)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label>Número de Ticket Generado <span className="req">*</span></label>
                                <div className="ticket-input-group">
                                    <input
                                        type="text"
                                        placeholder="Ej: TCK-DN-2026-9011"
                                        value={ticketNumber}
                                        onChange={e => setTicketNumber(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handleAutoTicket}
                                        title="Generar ID de Ticket aleatorio"
                                    >
                                        Generar ID
                                    </button>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Nota de Solución / Respuesta</label>
                                <textarea
                                    rows={2}
                                    placeholder="Ej: Lote liberado exitosamente en consola central."
                                    value={resolutionNote}
                                    onChange={e => setResolutionNote(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                        <button type="submit" className="btn-dn-primary">
                            <i data-lucide="check-circle"></i> Guardar y Notificar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
