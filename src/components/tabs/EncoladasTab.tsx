/* ==========================================================================
   PESTAÑA SOLICITUDES ENCOLADAS PDV (ENCOLADASTAB.TSX)
   ========================================================================== */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateUniqueReqId } from '../../types';
import { getMySubmittedIds } from '../../services/storageService';
import { isImageFilename, compressImageFile, dataURLtoBlob, triggerBlobDownload, generateFallbackImageBlob } from '../../services/fileService';
import { buildSubmissionEmailData, triggerEmailJsSend } from '../../services/emailService';

export const EncoladasTab: React.FC = () => {
    const { requests, submitRequest, showToast, isReportingAuthenticated, openEmailPreviewModal } = useApp();

    const [encType, setEncType] = useState<'SPECIFIC_PDVS' | 'GENERAL'>('SPECIFIC_PDVS');
    const [email, setEmail] = useState('');
    const [estudio, setEstudio] = useState('KO moderno');
    const [pais, setPais] = useState('Colombia');
    const [ola, setOla] = useState('Julio 2026');
    const [pdvsText, setPdvsText] = useState('');
    const [solicitante, setSolicitante] = useState('');
    const [observaciones, setObservaciones] = useState('');
    
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
    const [isImageFile, setIsImageFile] = useState<boolean>(false);

    const myIds = getMySubmittedIds();
    const myEncoladas = requests.filter(r =>
        r.category === 'ENCOLADA' && (myIds.includes(r.id) || isReportingAuthenticated)
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isImg = file.type.startsWith('image/') || isImageFilename(file.name);
            setFileName(file.name);
            setIsImageFile(isImg);

            if (isImg) {
                compressImageFile(file, compressedUrl => {
                    setFileDataUrl(compressedUrl);
                });
            } else {
                const reader = new FileReader();
                reader.onload = ev => {
                    setFileDataUrl(ev.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFileName(null);
            setFileDataUrl(null);
            setIsImageFile(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let pdvCodes: string[] = [];
        let isGen = false;

        if (encType === 'SPECIFIC_PDVS') {
            pdvCodes = pdvsText
                .split(/[\s,\n]+/)
                .map(s => s.trim().toUpperCase())
                .filter(s => s.length > 0)
                .map(s => s.startsWith('PDV-') ? s : 'PDV-' + s);
        } else {
            isGen = true;
        }

        const newReq = {
            id: generateUniqueReqId(),
            category: 'ENCOLADA' as const,
            isGeneralReview: isGen,
            pdvCodes: pdvCodes,
            pdvCode: isGen ? 'Revisión General Estudio' : pdvCodes.join(', '),
            email: email.trim(),
            estudio,
            pais,
            ola,
            solicitante: solicitante.trim() || 'Operaciones D&N',
            analyst: null,
            detalle: observaciones.trim() || 'Sin observaciones.',
            fileName,
            fileDataUrl,
            status: 'PENDING' as const,
            ticketNumber: null,
            resolutionNote: null,
            createdAt: new Date().toISOString(),
            resolvedAt: null
        };

        await submitRequest(newReq);

        const emailData = buildSubmissionEmailData(newReq);
        openEmailPreviewModal(emailData.recipientsStr, emailData.subject, emailData.htmlBody);
        triggerEmailJsSend(emailData, newReq);

        // Reset
        setEmail('');
        setPdvsText('');
        setSolicitante('');
        setObservaciones('');
        setFileName(null);
        setFileDataUrl(null);
    };

    const handleDownload = (req: any) => {
        if (!req.fileName) return;
        const isImg = isImageFilename(req.fileName);

        if (isImg) {
            if (req.fileDataUrl && req.fileDataUrl.startsWith('data:')) {
                const blob = dataURLtoBlob(req.fileDataUrl);
                if (blob) {
                    triggerBlobDownload(blob, req.fileName);
                    showToast(`Descargando imagen: ${req.fileName}`, 'success');
                    return;
                }
            }
            generateFallbackImageBlob(req, blob => {
                const outName = req.fileName.match(/\.(png|jpg|jpeg|gif)$/i) ? req.fileName : req.fileName + '.png';
                triggerBlobDownload(blob, outName);
                showToast(`Descargando vista previa de imagen: ${outName}`, 'success');
            });
        } else {
            showToast(`📧 El archivo "${req.fileName}" fue adjuntado y enviado directamente en la notificación por correo.`, 'info');
        }
    };

    return (
        <div className="tab-content active" id="tab-encoladas">
            <div className="grid-2-cols">
                {/* Formulario Izquierda */}
                <div className="card-box">
                    <div className="card-header">
                        <h2><i data-lucide="plus-circle"></i> Registrar Solicitud de Encolada</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="type-selector-box">
                            <label style={{ display: 'block', marginBottom: '8px' }}>Tipo de Solicitud Encolada</label>
                            <div className="type-toggle-group">
                                <label className="radio-card">
                                    <input
                                        type="radio"
                                        name="encType"
                                        checked={encType === 'SPECIFIC_PDVS'}
                                        onChange={() => setEncType('SPECIFIC_PDVS')}
                                    />
                                    <span className="radio-content">
                                        <i data-lucide="list"></i> PDVs Específicos
                                    </span>
                                </label>
                                <label className="radio-card">
                                    <input
                                        type="radio"
                                        name="encType"
                                        checked={encType === 'GENERAL'}
                                        onChange={() => setEncType('GENERAL')}
                                    />
                                    <span className="radio-content">
                                        <i data-lucide="search"></i> Revisión General
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tu Correo Electrónico Corporativo <span className="req">*</span></label>
                            <div className="input-with-icon">
                                <i data-lucide="mail"></i>
                                <input
                                    type="email"
                                    placeholder="ejemplo@dichter-neira.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Estudio <span className="req">*</span></label>
                                <select value={estudio} onChange={e => setEstudio(e.target.value)} required>
                                    <option value="KO moderno">KO moderno</option>
                                    <option value="KO tradicional">KO tradicional</option>
                                    <option value="Lindley">Lindley</option>
                                    <option value="Heineken">Heineken</option>
                                    <option value="Storelive">Storelive</option>
                                    <option value="P&G">P&G</option>
                                    <option value="CBC">CBC</option>
                                    <option value="ABI">ABI</option>
                                    <option value="AJE">AJE</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>País <span className="req">*</span></label>
                                <select value={pais} onChange={e => setPais(e.target.value)} required>
                                    <option value="Colombia">Colombia</option>
                                    <option value="Bolivia">Bolivia</option>
                                    <option value="Chile">Chile</option>
                                    <option value="Costa Rica">Costa Rica</option>
                                    <option value="Ecuador">Ecuador</option>
                                    <option value="El Salvador">El Salvador</option>
                                    <option value="Guatemala">Guatemala</option>
                                    <option value="Honduras">Honduras</option>
                                    <option value="Nicaragua">Nicaragua</option>
                                    <option value="Panamá">Panamá</option>
                                    <option value="Paraguay">Paraguay</option>
                                    <option value="Perú">Perú</option>
                                    <option value="República Dominicana">República Dominicana</option>
                                    <option value="Uruguay">Uruguay</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Ola del Estudio <span className="req">*</span></label>
                                <select value={ola} onChange={e => setOla(e.target.value)} required>
                                    <option value="Julio 2026">Julio 2026</option>
                                    <option value="Agosto 2026">Agosto 2026</option>
                                    <option value="Septiembre 2026">Septiembre 2026</option>
                                    <option value="Octubre 2026">Octubre 2026</option>
                                    <option value="Noviembre 2026">Noviembre 2026</option>
                                    <option value="Diciembre 2026">Diciembre 2026</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Solicitante / Operaciones</label>
                                <input
                                    type="text"
                                    placeholder="Nombre de quien solicita"
                                    value={solicitante}
                                    onChange={e => setSolicitante(e.target.value)}
                                />
                            </div>
                        </div>

                        {encType === 'SPECIFIC_PDVS' ? (
                            <div className="form-group">
                                <label>Códigos de PDVs Encolados <span className="req">*</span></label>
                                <textarea
                                    rows={3}
                                    placeholder="Ingresa uno o varios códigos separados por coma o espacio (ej: PDV-88412, PDV-77109)"
                                    value={pdvsText}
                                    onChange={e => setPdvsText(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <div className="info-alert-box" style={{ marginBottom: '16px' }}>
                                <i data-lucide="info"></i>
                                <span>Revisión general: El equipo de Reporting auditará todas las terminales encoladas pertenecientes a <strong>{estudio} ({pais})</strong>.</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Adjuntar Foto o Excel Soporte (Opcional)</label>
                            <input type="file" onChange={handleFileChange} />
                            {fileName && (
                                <div style={{ marginTop: '6px' }}>
                                    {isImageFile ? (
                                        <span className="file-attached-chip clickable">
                                            <i data-lucide="image"></i> Imagen lista: <strong>{fileName}</strong>
                                        </span>
                                    ) : (
                                        <span className="file-attached-chip email-badge">
                                            <i data-lucide="mail-check"></i> Archivo adjunto: <strong>{fileName}</strong> (Enviado al correo)
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Observaciones / Detalle</label>
                            <textarea
                                rows={2}
                                placeholder="Escribe alguna novedad u observación relevante..."
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-dn-primary full-width">
                            <i data-lucide="send"></i> Enviar Solicitud de Encolada
                        </button>
                    </form>
                </div>

                {/* Historial Derecha */}
                <div className="card-box">
                    <div className="card-header">
                        <h2><i data-lucide="history"></i> Mis Solicitudes de Encoladas</h2>
                        <span className="badge-total-encoladas">{myEncoladas.length} registradas</span>
                    </div>

                    <div className="feed-container">
                        {myEncoladas.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 15px' }}>
                                <i data-lucide="inbox" style={{ width: 32, height: 32, opacity: 0.5, marginBottom: 8 }}></i>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sin encoladas en este equipo</p>
                                <small style={{ fontSize: '0.78rem' }}>Las solicitudes que envíes desde tu computador aparecerán aquí para consulta directa.</small>
                            </div>
                        ) : (
                            myEncoladas.map(req => {
                                const isResolved = req.status === 'RESOLVED';
                                const isInProgress = req.status === 'IN_PROGRESS';

                                return (
                                    <div className="item-card" key={req.id}>
                                        <div className="item-top">
                                            <div>
                                                {req.isGeneralReview ? (
                                                    <span className="general-review-tag"><i data-lucide="search"></i> Revisión General</span>
                                                ) : (
                                                    <span className="tag-code">{req.pdvCode}</span>
                                                )}
                                            </div>
                                            <span className={`chip-status ${req.status.toLowerCase()}`}>
                                                {isResolved ? 'Ticket Asignado' : isInProgress ? `🔵 En Proceso (${req.deliveryDate})` : 'En Espera'}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            Estudio: <strong>{req.estudio}</strong> | País: <strong>{req.pais}</strong> | Ola: <strong>{req.ola}</strong>
                                        </div>

                                        {req.fileName && (
                                            <div style={{ marginBottom: '4px' }}>
                                                {isImageFilename(req.fileName) ? (
                                                    <button type="button" className="file-attached-chip clickable" onClick={() => handleDownload(req)}>
                                                        <i data-lucide="image"></i> 🖼️ {req.fileName} (Descargar)
                                                    </button>
                                                ) : (
                                                    <span className="file-attached-chip email-badge" onClick={() => handleDownload(req)} style={{ cursor: 'pointer' }}>
                                                        <i data-lucide="mail-check"></i> 📎 {req.fileName} (Adjuntado al correo)
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {req.analyst && (
                                            <div>
                                                <span className="analyst-chip">Analista: {req.analyst}</span>
                                            </div>
                                        )}

                                        {isResolved && req.ticketNumber && (
                                            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(20,168,59,0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--dn-green)', fontWeight: 800 }}>
                                                    Ticket: {req.ticketNumber}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
