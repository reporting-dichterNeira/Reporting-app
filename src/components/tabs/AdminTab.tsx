/* ==========================================================================
   PESTAÑA MESA DE REPORTING ADMIN (ADMINTAB.TSX)
   ========================================================================== */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isImageFilename, dataURLtoBlob, triggerBlobDownload, generateFallbackImageBlob } from '../../services/fileService';

export const AdminTab: React.FC = () => {
    const { requests, openModal, deleteRequest, showToast } = useApp();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [analystFilter, setAnalystFilter] = useState('ALL');

    const totalPending = requests.filter(r => r.status === 'PENDING').length;
    const totalEncoladas = requests.filter(r => r.category === 'ENCOLADA').length;
    const totalBI = requests.filter(r => r.category.startsWith('BI_')).length;
    const totalResolved = requests.filter(r => r.status === 'RESOLVED').length;

    const filteredRequests = requests.filter(req => {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
            (req.pdvCode && req.pdvCode.toLowerCase().includes(q)) ||
            (req.estudio && req.estudio.toLowerCase().includes(q)) ||
            (req.pais && req.pais.toLowerCase().includes(q)) ||
            (req.email && req.email.toLowerCase().includes(q)) ||
            (req.solicitante && req.solicitante.toLowerCase().includes(q)) ||
            (req.analyst && req.analyst.toLowerCase().includes(q)) ||
            (req.ticketNumber && req.ticketNumber.toLowerCase().includes(q));

        const matchesCat = categoryFilter === 'ALL' || req.category === categoryFilter;

        let matchesAnalyst = true;
        if (analystFilter === 'UNASSIGNED') {
            matchesAnalyst = !req.analyst;
        } else if (analystFilter !== 'ALL') {
            matchesAnalyst = req.analyst === analystFilter;
        }

        return matchesQuery && matchesCat && matchesAnalyst;
    });

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

    const handleExportCSV = () => {
        if (requests.length === 0) {
            showToast('No hay datos para exportar', 'warning');
            return;
        }

        let csv = "data:text/csv;charset=utf-8,ID,Categoria,Estudio,Pais,CorreoSolicitante,Analista,Estado,Ticket,Respuesta\n";

        requests.forEach(r => {
            const row = [
                r.id,
                `"${r.category}"`,
                `"${r.estudio}"`,
                `"${r.pais}"`,
                `"${r.email || r.solicitante || ''}"`,
                `"${r.analyst || 'Sin Asignar'}"`,
                `"${r.status}"`,
                `"${r.ticketNumber || ''}"`,
                `"${(r.resolutionNote || '').replace(/"/g, '""')}"`
            ].join(",");
            csv += row + "\n";
        });

        const encodedUri = encodeURI(csv);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_DichtnerNeira_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="tab-content active" id="tab-admin">
            {/* Métricas Superiores */}
            <div className="metrics-row">
                <div className="metric-box amber">
                    <div className="m-icon"><i data-lucide="clock"></i></div>
                    <div>
                        <div className="m-label">Pendientes</div>
                        <h3>{totalPending}</h3>
                    </div>
                </div>
                <div className="metric-box blue">
                    <div className="m-icon"><i data-lucide="database"></i></div>
                    <div>
                        <div className="m-label">Encoladas PDV</div>
                        <h3>{totalEncoladas}</h3>
                    </div>
                </div>
                <div className="metric-box purple">
                    <div className="m-icon"><i data-lucide="bar-chart"></i></div>
                    <div>
                        <div className="m-label">Power BI / Esporádicas</div>
                        <h3>{totalBI}</h3>
                    </div>
                </div>
                <div className="metric-box green">
                    <div className="m-icon"><i data-lucide="check-circle"></i></div>
                    <div>
                        <div className="m-label">Resueltas</div>
                        <h3>{totalResolved}</h3>
                    </div>
                </div>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="card-box" style={{ marginBottom: '20px' }}>
                <div className="admin-top-bar">
                    <div className="search-filter-box">
                        <div className="input-with-icon search-input-wrap">
                            <i data-lucide="search"></i>
                            <input
                                type="text"
                                placeholder="Buscar por ID, estudio, país, correo o ticket..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="ALL">Todas las Categorías</option>
                            <option value="ENCOLADA">Encoladas PDV</option>
                            <option value="BI_EXISTING">BI Existente</option>
                            <option value="BI_NEW">BI Nuevo</option>
                            <option value="BI_SPORADIC">Esporádica</option>
                        </select>
                        <select value={analystFilter} onChange={e => setAnalystFilter(e.target.value)}>
                            <option value="ALL">Todas las Analistas</option>
                            <option value="Mayumi Sanchez">Mayumi Sanchez</option>
                            <option value="Juliana Chimbi">Juliana Chimbi</option>
                            <option value="UNASSIGNED">Sin Asignar</option>
                        </select>
                    </div>

                    <button className="btn-secondary" onClick={handleExportCSV}>
                        <i data-lucide="download"></i> Exportar CSV
                    </button>
                </div>
            </div>

            {/* Tabla Global de Solicitudes */}
            <div className="card-box">
                <div className="table-responsive-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Categoría</th>
                                <th>Detalle / PDVs</th>
                                <th>Estudio</th>
                                <th>País</th>
                                <th>Solicitante</th>
                                <th>Analista</th>
                                <th>Estado</th>
                                <th>Ticket / Entrega</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        No se encontraron solicitudes con los criterios de búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map(req => {
                                    const isResolved = req.status === 'RESOLVED';
                                    const isInProgress = req.status === 'IN_PROGRESS';
                                    const dateStr = new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                                    let categoryLabel = 'Encolada PDV';
                                    let detailText = req.pdvCode || '--';
                                    if (req.isGeneralReview) {
                                        detailText = 'Revisión General de Estudio';
                                    } else if (req.category === 'BI_EXISTING') {
                                        categoryLabel = 'BI Existente';
                                        detailText = req.biNameToEdit || 'Power BI';
                                    } else if (req.category === 'BI_NEW') {
                                        categoryLabel = 'BI Nuevo';
                                        detailText = `Área: ${req.area}`;
                                    } else if (req.category === 'BI_SPORADIC') {
                                        categoryLabel = 'Esporádica';
                                        detailText = 'Requerimiento Esporádico';
                                    }

                                    return (
                                        <tr key={req.id}>
                                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{dateStr}</td>
                                            <td><span className={`tag-category ${req.category === 'BI_SPORADIC' ? 'sporadic' : ''}`}>{categoryLabel}</span></td>
                                            <td>
                                                <strong>{detailText}</strong>
                                                {req.fileName && (
                                                    <div style={{ marginTop: '2px' }}>
                                                        {isImageFilename(req.fileName) ? (
                                                            <button type="button" className="file-attached-chip clickable" onClick={() => handleDownload(req)}>
                                                                <i data-lucide="image"></i> 🖼️ {req.fileName}
                                                            </button>
                                                        ) : (
                                                            <span className="file-attached-chip email-badge" onClick={() => handleDownload(req)} style={{ cursor: 'pointer' }}>
                                                                <i data-lucide="mail-check"></i> 📎 {req.fileName}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{req.estudio}</td>
                                            <td>{req.pais}</td>
                                            <td><span style={{ fontSize: '0.81rem', color: 'var(--dn-blue-primary)' }}>{req.email || req.solicitante || 'N/A'}</span></td>
                                            <td>
                                                {req.analyst ? (
                                                    <span className="analyst-chip">{req.analyst}</span>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--dn-orange)', fontStyle: 'italic' }}>-- Sin Asignar --</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`chip-status ${req.status.toLowerCase()}`}>
                                                    {isResolved ? 'Resuelto' : isInProgress ? 'En Proceso' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td>
                                                {isResolved ? (
                                                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--dn-green)', fontWeight: 700 }}>{req.ticketNumber}</span>
                                                ) : isInProgress ? (
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--dn-blue-primary)', fontWeight: 700 }}>📅 {req.deliveryDate || 'Acordada'}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-subtle)' }}>-- Sin Asignar --</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons-cell">
                                                    <button className="btn-secondary btn-sm" onClick={() => openModal(req.id)} title="Gestionar estado">
                                                        <i data-lucide="edit-2"></i> Gestionar
                                                    </button>
                                                    <button className="btn-danger btn-sm" onClick={() => deleteRequest(req.id)} title="Eliminar solicitud">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
