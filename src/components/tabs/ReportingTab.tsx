/* ==========================================================================
   PESTAÑA SOLICITUDES DE REPORTING POWER BI (REPORTINGTAB.TSX)
   ========================================================================== */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateUniqueReqId } from '../../types';
import { getMySubmittedIds } from '../../services/storageService';
import { isImageFilename, compressImageFile, dataURLtoBlob, triggerBlobDownload, generateFallbackImageBlob } from '../../services/fileService';
import { buildSubmissionEmailData, triggerEmailJsSend } from '../../services/emailService';

export const ReportingTab: React.FC = () => {
    const { requests, submitRequest, showToast, isReportingAuthenticated, openEmailPreviewModal } = useApp();

    const [biType, setBiType] = useState<'EXISTING' | 'NEW' | 'SPORADIC'>('EXISTING');
    const [email, setEmail] = useState('');
    const [estudio, setEstudio] = useState('KO moderno');
    const [pais, setPais] = useState('Colombia');
    const [usuario, setUsuario] = useState('');
    const [biName, setBiName] = useState('');
    const [frecuencia, setFrecuencia] = useState('Semanal');
    const [area, setArea] = useState('');
    const [detalle, setDetalle] = useState('');

    const [fileName, setFileName] = useState<string | null>(null);
    const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
    const [isImageFile, setIsImageFile] = useState<boolean>(false);

    const myIds = getMySubmittedIds();
    const myReportingReqs = requests.filter(r =>
        (r.category === 'BI_EXISTING' || r.category === 'BI_NEW' || r.category === 'BI_SPORADIC') &&
        (myIds.includes(r.id) || isReportingAuthenticated)
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isImg = file.type.startsWith('image/') || isImageFilename(file.name);
            setFileName(file.name);
            setIsImageFile(isImg);

            if (isImg) {
                compressImageFile(file, compressedUrl => setFileDataUrl(compressedUrl));
            } else {
                const reader = new FileReader();
                reader.onload = ev => setFileDataUrl(ev.target?.result as string);
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

        let catName: any = 'BI_EXISTING';
        if (biType === 'NEW') catName = 'BI_NEW';
        else if (biType === 'SPORADIC') catName = 'BI_SPORADIC';

        let solicitanteStr = email.trim();
        if (biType === 'EXISTING') solicitanteStr = usuario.trim();
        else if (biType === 'NEW') solicitanteStr = `Área: ${area.trim()}`;

        const newReq = {
            id: generateUniqueReqId(),
            category: catName,
            email: email.trim(),
            estudio,
            pais,
            usuario: biType === 'EXISTING' ? usuario.trim() : undefined,
            biNameToEdit: biType === 'EXISTING' ? biName.trim() : undefined,
            frecuencia: biType === 'NEW' ? frecuencia : undefined,
            area: biType === 'NEW' ? area.trim() : undefined,
            solicitante: solicitanteStr,
            analyst: null,
            detalle: detalle.trim(),
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
        setUsuario('');
        setBiName('');
        setArea('');
        setDetalle('');
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
        <div className="tab-content active" id="tab-reporting">
            <div className="grid-2-cols">
                {/* Formulario Izquierda */}
                <div className="card-box">
                    <div className="card-header">
                        <h2><i data-lucide="bar-chart-2"></i> Solicitud al Equipo de Reporting</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="type-selector-box">
                            <label style={{ display: 'block', marginBottom: '8px' }}>Categoría del Requerimiento</label>
                            <div className="type-toggle-group three-cols">
                                <label className="radio-card">
                                    <input
                                        type="radio"
                                        name="biType"
                                        checked={biType === 'EXISTING'}
                                        onChange={() => setBiType('EXISTING')}
                                    />
                                    <span className="radio-content">
                                        <i data-lucide="edit"></i> BI Existente
                                    </span>
                                </label>
                                <label className="radio-card">
                                    <input
                                        type="radio"
                                        name="biType"
                                        checked={biType === 'NEW'}
                                        onChange={() => setBiType('NEW')}
                                    />
                                    <span className="radio-content">
                                        <i data-lucide="sparkles"></i> Power BI Nuevo
                                    </span>
                                </label>
                                <label className="radio-card">
                                    <input
                                        type="radio"
                                        name="biType"
                                        checked={biType === 'SPORADIC'}
                                        onChange={() => setBiType('SPORADIC')}
                                    />
                                    <span className="radio-content">
                                        <i data-lucide="zap"></i> Solicitud Esporádica
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

                        {biType === 'EXISTING' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Usuario Solicitante <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Nombre o correo del usuario"
                                        value={usuario}
                                        onChange={e => setUsuario(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nombre del Power BI a Modificar <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Tablero Ventas LatAm"
                                        value={biName}
                                        onChange={e => setBiName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {biType === 'NEW' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Frecuencia Requerida <span className="req">*</span></label>
                                    <select value={frecuencia} onChange={e => setFrecuencia(e.target.value)}>
                                        <option value="Diaria">Diaria</option>
                                        <option value="Semanal">Semanal</option>
                                        <option value="Quincenal">Quincenal</option>
                                        <option value="Mensual">Mensual</option>
                                        <option value="Puntual / Una Vez">Puntual / Una Vez</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Área o Departamento <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Trade Marketing, Operaciones"
                                        value={area}
                                        onChange={e => setArea(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {biType === 'SPORADIC' && (
                            <div className="info-alert-box" style={{ marginBottom: '16px' }}>
                                <i data-lucide="info"></i>
                                <span>Solicitud Esporádica: Requerimiento puntual de extracción de información o análisis rápido.</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Detalle del Requerimiento <span className="req">*</span></label>
                            <textarea
                                rows={3}
                                placeholder="Describe detalladamente qué cambios, datos o indicadores necesitas..."
                                value={detalle}
                                onChange={e => setDetalle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Adjuntar Foto o Excel de Soporte (Opcional)</label>
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

                        <button type="submit" className="btn-dn-primary full-width">
                            <i data-lucide="send"></i> Enviar Solicitud a Reporting
                        </button>
                    </form>
                </div>

                {/* Historial Derecha */}
                <div className="card-box">
                    <div className="card-header">
                        <h2><i data-lucide="history"></i> Mis Solicitudes a Reporting</h2>
                        <span className="badge-total-encoladas">{myReportingReqs.length} registradas</span>
                    </div>

                    <div className="feed-container">
                        {myReportingReqs.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 15px' }}>
                                <i data-lucide="inbox" style={{ width: 32, height: 32, opacity: 0.5, marginBottom: 8 }}></i>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sin solicitudes en este equipo</p>
                                <small style={{ fontSize: '0.78rem' }}>Las solicitudes que envíes a Reporting desde tu computador aparecerán aquí.</small>
                            </div>
                        ) : (
                            myReportingReqs.map(req => {
                                const isResolved = req.status === 'RESOLVED';
                                const isInProgress = req.status === 'IN_PROGRESS';
                                const isNew = req.category === 'BI_NEW';
                                const isSporadic = req.category === 'BI_SPORADIC';

                                let catLabel = 'Edición BI Existente';
                                if (isNew) catLabel = 'Power BI Nuevo';
                                if (isSporadic) catLabel = 'Solicitud Esporádica';

                                let detailHeader = `BI: ${req.biNameToEdit}`;
                                if (isNew) detailHeader = `Área: ${req.area} (${req.frecuencia})`;
                                if (isSporadic) detailHeader = `Requerimiento Esporádico`;

                                return (
                                    <div className="item-card" key={req.id}>
                                        <div className="item-top">
                                            <span className={`tag-category ${isSporadic ? 'sporadic' : ''}`}>{catLabel}</span>
                                            <span className={`chip-status ${req.status.toLowerCase()}`}>
                                                {isResolved ? 'Completado' : isInProgress ? `🔵 En Proceso (${req.deliveryDate})` : 'En Evaluación'}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                                            {detailHeader}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Estudio: {req.estudio} | País: {req.pais}
                                        </div>

                                        {req.fileName && (
                                            <div style={{ marginTop: '4px' }}>
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
                                            <div style={{ marginTop: '4px' }}>
                                                <span className="analyst-chip">Analista: {req.analyst}</span>
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
