/* ==========================================================================
   PORTAL DICHTER & NEIRA - REACT 18 PRODUCTION APP (APP.JS v13.0)
   Ejecución 100% nativa en GitHub Pages sin pantallas en blanco
   ========================================================================== */

const { useState, useEffect, useMemo, createContext, useContext } = React;

const STORAGE_KEY = 'dn_portal_requests_v30';
const NOVEDADES_KEY = 'dn_portal_novedades_v14';
const REPORTING_SESSION_KEY = 'dn_portal_reporting_auth';
const MY_REQUESTS_KEY = 'dn_portal_my_submitted_ids_v1';
const SYNC_API_URL = 'https://jsonblob.com/api/jsonBlob/019fb398-a51c-79af-a1fd-c0095e6459fe';

const EMAILJS_SERVICE_ID = 'service_b1jhrai';
const EMAILJS_TEMPLATE_ID = 'template_cpy03f3';
const EMAILJS_PUBLIC_KEY = 'OfXawgXmm_YWqDj4B';
const REPORTING_TEAM_EMAILS = ['masanchez@dichter-neira.com', 'jchimbi@dichter-neira.com'];

const colombianHolidays2026 = [
    { iso: '2026-01-01', dateLabel: '1 Enero', day: 'Jueves', name: 'Año Nuevo' },
    { iso: '2026-01-12', dateLabel: '12 Enero', day: 'Lunes', name: 'Día de los Reyes Magos' },
    { iso: '2026-03-23', dateLabel: '23 Marzo', day: 'Lunes', name: 'Día de San José' },
    { iso: '2026-04-02', dateLabel: '2 Abril', day: 'Jueves', name: 'Jueves Santo' },
    { iso: '2026-04-03', dateLabel: '3 Abril', day: 'Viernes', name: 'Viernes Santo' },
    { iso: '2026-05-01', dateLabel: '1 Mayo', day: 'Viernes', name: 'Día del Trabajo' },
    { iso: '2026-05-18', dateLabel: '18 Mayo', day: 'Lunes', name: 'Día de la Ascensión' },
    { iso: '2026-06-08', dateLabel: '8 Junio', day: 'Lunes', name: 'Corpus Christi' },
    { iso: '2026-06-15', dateLabel: '15 Junio', day: 'Lunes', name: 'Sagrado Corazón de Jesús' },
    { iso: '2026-06-29', dateLabel: '29 Junio', day: 'Lunes', name: 'San Pedro y San Pablo' },
    { iso: '2026-07-20', dateLabel: '20 Julio', day: 'Lunes', name: 'Día de la Independencia de Colombia' },
    { iso: '2026-07-29', dateLabel: '29 Julio', day: 'Miércoles', name: 'Día de Conmemoras D&N' },
    { iso: '2026-08-07', dateLabel: '7 Agosto', day: 'Viernes', name: 'Batalla de Boyacá' },
    { iso: '2026-08-17', dateLabel: '17 Agosto', day: 'Lunes', name: 'La Asunción de la Virgen' },
    { iso: '2026-10-12', dateLabel: '12 Octubre', day: 'Lunes', name: 'Día de la Raza' },
    { iso: '2026-11-02', dateLabel: '2 Noviembre', day: 'Lunes', name: 'Día de Todos los Santos' },
    { iso: '2026-11-16', dateLabel: '16 Noviembre', day: 'Lunes', name: 'Independencia de Cartagena' },
    { iso: '2026-12-08', dateLabel: '8 Diciembre', day: 'Martes', name: 'Día de la Inmaculada Concepción' },
    { iso: '2026-12-25', dateLabel: '25 Diciembre', day: 'Viernes', name: 'Navidad' }
];

function generateUniqueReqId() {
    const timeStr = Date.now().toString().slice(-4);
    const rand = Math.floor(100 + Math.random() * 900);
    return `REQ-${timeStr}-${rand}`;
}

function getMySubmittedIds() {
    try {
        const raw = localStorage.getItem(MY_REQUESTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function recordMySubmittedId(id) {
    try {
        const list = getMySubmittedIds();
        if (!list.includes(id)) {
            list.unshift(id);
            localStorage.setItem(MY_REQUESTS_KEY, JSON.stringify(list));
        }
    } catch (e) {}
}

function isImageFilename(filename) {
    if (!filename) return false;
    return !!filename.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);
}

function compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', 0.75));
            } else {
                callback(e.target.result);
            }
        };
        img.onerror = function() { callback(e.target.result); };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function dataURLtoBlob(dataurl) {
    if (!dataurl || typeof dataurl !== 'string' || !dataurl.includes(',')) return null;
    try {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        return null;
    }
}

function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function generateFallbackImageBlob(req, callback) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 800, 450);
    grad.addColorStop(0, '#0D5CAB');
    grad.addColorStop(1, '#24335F');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('DICHTER & NEIRA - REGISTRO DE ADJUNTO', 40, 50);

    ctx.fillStyle = '#33BDEE';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Solicitud ID: ${req.id}`, 40, 90);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(40, 110, 720, 290);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Nombre de Imagen: ${req.fileName}`, 60, 150);
    ctx.fillText(`Estudio: ${req.estudio} | País: ${req.pais}`, 60, 190);
    ctx.fillText(`Solicitante: ${req.email || req.solicitante || 'N/A'}`, 60, 230);
    ctx.fillText(`Analista Asignada: ${req.analyst || 'Sin Asignar'}`, 60, 270);
    ctx.fillText(`Estado Actual: ${req.status}`, 60, 310);
    ctx.fillText(`Detalle: "${(req.detalle || '').slice(0, 65)}"`, 60, 350);

    canvas.toBlob(blob => { if (blob) callback(blob); }, 'image/png');
}

// App Root React Component
function App() {
    const [requests, setRequests] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return [];
    });

    const [analystStatus, setAnalystStatus] = useState(() => {
        try {
            const raw = localStorage.getItem(NOVEDADES_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return [{
            analyst: 'Juliana Chimbi',
            status: 'VACACIONES',
            dateStart: '2026-08-15',
            dateEnd: '2026-08-25',
            dates: 'Del 15/08/2026 al 25/08/2026',
            note: '🏖️ En periodo de vacaciones. Durante estos días Mayumi Sanchez estará atendiendo y respaldando sus tareas.'
        }];
    });

    const [isAuth, setIsAuth] = useState(() => sessionStorage.getItem(REPORTING_SESSION_KEY) === 'true');
    const [activeTab, setActiveTab] = useState('encoladas');
    const [activeModalId, setActiveModalId] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [isCloudOnline, setIsCloudOnline] = useState(true);
    const [emailModal, setEmailModal] = useState({ isOpen: false, toEmail: '', subject: '', htmlBody: '' });

    const [splashFade, setSplashFade] = useState(false);
    const [splashShow, setSplashShow] = useState(true);

    useEffect(() => {
        const t1 = setTimeout(() => setSplashFade(true), 1800);
        const t2 = setTimeout(() => setSplashShow(false), 2400);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); } catch (e) {}
    }, [requests]);

    useEffect(() => {
        try { localStorage.setItem(NOVEDADES_KEY, JSON.stringify(analystStatus)); } catch (e) {}
    }, [analystStatus]);

    const fetchCloud = async () => {
        try {
            const resp = await fetch(SYNC_API_URL, { cache: 'no-store' });
            if (resp.ok) {
                const data = await resp.json();
                setIsCloudOnline(true);
                if (data && Array.isArray(data.requests)) {
                    setRequests(prev => {
                        const map = new Map();
                        prev.forEach(r => map.set(r.id, r));
                        data.requests.forEach(cloudReq => {
                            if (!map.has(cloudReq.id)) {
                                map.set(cloudReq.id, cloudReq);
                            } else {
                                const localReq = map.get(cloudReq.id);
                                let bestUrl = cloudReq.fileDataUrl;
                                if (localReq.fileDataUrl && (!cloudReq.fileDataUrl || localReq.fileDataUrl.length > cloudReq.fileDataUrl.length)) {
                                    bestUrl = localReq.fileDataUrl;
                                }
                                map.set(cloudReq.id, { ...cloudReq, ...localReq, fileDataUrl: bestUrl });
                            }
                        });
                        const merged = Array.from(map.values());
                        merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                        return merged;
                    });
                }
                if (data && Array.isArray(data.analystStatus)) {
                    setAnalystStatus(data.analystStatus);
                }
            }
        } catch (e) {
            setIsCloudOnline(false);
        }
    };

    useEffect(() => {
        fetchCloud();
        const interval = setInterval(fetchCloud, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    const showToast = (text, type = 'success') => {
        const id = Math.random().toString();
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const syncCloud = async (reqs, statusArr) => {
        const sanitized = reqs.map(r => {
            const copy = { ...r };
            if (copy.fileDataUrl && copy.fileDataUrl.length > 2500000) copy.fileDataUrl = null;
            return copy;
        });

        try {
            await fetch(SYNC_API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests: sanitized, analystStatus: statusArr, lastUpdated: new Date().toISOString() })
            });
        } catch (e) {}
    };

    const handleTabChange = (tab) => {
        if ((tab === 'admin' || tab === 'vacaciones' || tab === 'analytics') && !isAuth) {
            setActiveModalId('AUTH_MODAL');
            return;
        }
        setActiveTab(tab);
    };

    const handleLogin = (u, p) => {
        const userClean = u.trim().toLowerCase();
        if ((userClean === 'reporting' || userClean.includes('reporting')) && p.trim() === 'rep123') {
            setIsAuth(true);
            sessionStorage.setItem(REPORTING_SESSION_KEY, 'true');
            setActiveModalId(null);
            setActiveTab('admin');
            showToast('¡Desbloqueadas pestañas de Reporting, Vacaciones y Analytics!', 'success');
        } else {
            showToast('Credenciales de Reporting incorrectas', 'warning');
        }
    };

    const handleLogout = () => {
        setIsAuth(false);
        sessionStorage.removeItem(REPORTING_SESSION_KEY);
        setActiveTab('encoladas');
        showToast('Sesión de Reporting cerrada.', 'info');
    };

    const handleDownload = (req) => {
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

    const sendEmailNotification = (req, type = 'SUBMISSION') => {
        const userEmail = req.email || 'usuario@dichter-neira.com';
        const isEncolada = req.category === 'ENCOLADA';
        const isImg = isImageFilename(req.fileName);
        const recipientsStr = [userEmail, ...REPORTING_TEAM_EMAILS].join(', ');

        let subject = `[Nueva Solicitud ${req.id}] ${req.category}: ${req.estudio} (${req.pais})`;
        let htmlBody = '';

        if (type === 'SUBMISSION') {
            const commitment = isEncolada
                ? '⏳ <strong>La solicitud se revisará en un máximo de 2 días hábiles.</strong>'
                : '⏳ <strong>El equipo de Reporting se contactará en un plazo máximo de 3 días hábiles.</strong>';
            
            let att = '';
            if (req.fileName) {
                if (isImg) att = `<div><strong>Imagen Adjunta:</strong> 🖼️ ${req.fileName} (Descargable desde el portal)</div>`;
                else att = `<div style="color:#0D5CAB; font-weight:700;"><strong>Archivo Adjunto al Correo:</strong> 📎 ${req.fileName} (Ver adjunto a este correo)</div>`;
            }

            htmlBody = `
                <p>Hola <strong>${req.solicitante || 'Equipo D&N'}</strong>,</p>
                <p>Se ha recibido correctamente una nueva solicitud en el Portal Dichter & Neira.</p>
                <div style="background:rgba(13,92,171,0.08); border-left:4px solid #0D5CAB; padding:14px; margin:14px 0; border-radius:6px;">
                    ${commitment}
                </div>
                <div class="email-card-box">
                    <div><strong>Folio ID:</strong> ${req.id}</div>
                    <div><strong>Estudio:</strong> ${req.estudio} | <strong>País:</strong> ${req.pais}</div>
                    ${att}
                    <div><strong>Detalle:</strong> "${req.detalle}"</div>
                </div>
            `;
        } else if (type === 'IN_PROGRESS') {
            subject = `[En Proceso] Actualización Solicitud ${req.id} - Fecha de Entrega Acordada`;
            htmlBody = `
                <p>La solicitud <strong>${req.id}</strong> pasó a estado <strong>🔵 EN PROCESO</strong> por la analista <strong>${req.analyst}</strong>.</p>
                <div style="background:rgba(51,189,238,0.12); border-left:4px solid #0D5CAB; padding:16px; margin:14px 0; border-radius:6px;">
                    <div>📅 Fecha estimada de entrega: <strong>${req.deliveryDate}</strong></div>
                    <div>Detalles: "${req.inProgressNote || 'En proceso.'}"</div>
                </div>
            `;
        } else if (type === 'RESOLVED') {
            subject = `[Ticket Asignado] Solución Solicitud ${req.id} - D&N`;
            htmlBody = `
                <p>La solicitud <strong>${req.id}</strong> ha sido completada exitosamente por <strong>${req.analyst}</strong>:</p>
                <div class="email-ticket-highlight">
                    <div class="ticket-code-big">${req.ticketNumber}</div>
                </div>
                <div class="email-card-box">
                    <div><strong>Respuesta:</strong> "${req.resolutionNote || 'Resuelto exitosamente.'}"</div>
                </div>
            `;
        }

        setEmailModal({ isOpen: true, toEmail: recipientsStr, subject, htmlBody });

        if (typeof window.emailjs !== 'undefined') {
            recipientsStr.split(', ').forEach(emailAddr => {
                window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_email: emailAddr,
                    subject,
                    message: htmlBody,
                    name: 'Reporting Dichter & Neira',
                    content_attachment: req.fileDataUrl || '',
                    file_name: req.fileName || ''
                });
            });
        }
    };

    const myIds = getMySubmittedIds();

    return React.createElement('div', { className: 'app-layout' },
        // Splash Screen
        splashShow && React.createElement('div', { className: `splash-overlay ${splashFade ? 'splash-fade-out' : ''}` },
            React.createElement('div', { className: 'splash-content' },
                React.createElement('div', { className: 'splash-logo-badge' },
                    React.createElement('span', { className: 'splash-dn-bold' }, 'D&N')
                ),
                React.createElement('h2', { className: 'splash-title' }, 'Dichter & Neira'),
                React.createElement('div', { className: 'splash-subtitle' }, 'Mesa de Reporting & Operaciones LatAm'),
                React.createElement('div', { className: 'splash-loader-bar' },
                    React.createElement('div', { className: 'splash-loader-fill' })
                )
            )
        ),

        // Header
        React.createElement('header', { className: 'app-header' },
            React.createElement('div', { className: 'logo-container' },
                React.createElement('div', { className: 'dn-logo-badge' },
                    React.createElement('span', { className: 'dn-bold' }, 'D&N')
                ),
                React.createElement('div', { className: 'logo-text' },
                    React.createElement('div', { className: 'logo-title' },
                        'Dichter & Neira',
                        React.createElement('span', { className: 'badge-tag' }, 'Portal de Operaciones')
                    ),
                    React.createElement('div', { className: 'logo-subtitle' }, 'Gestión de Encoladas PDV & Mesa de Reporting Power BI')
                )
            ),
            React.createElement('nav', { className: 'main-nav' },
                React.createElement('button', { className: `nav-tab ${activeTab === 'encoladas' ? 'active' : ''}`, onClick: () => handleTabChange('encoladas') },
                    React.createElement('i', { 'data-lucide': 'database' }), ' Encoladas PDV'
                ),
                React.createElement('button', { className: `nav-tab ${activeTab === 'reporting' ? 'active' : ''}`, onClick: () => handleTabChange('reporting') },
                    React.createElement('i', { 'data-lucide': 'bar-chart-3' }), ' Solicitudes Reporting'
                ),
                React.createElement('button', { className: `nav-tab ${activeTab === 'novedades' ? 'active' : ''}`, onClick: () => handleTabChange('novedades') },
                    React.createElement('i', { 'data-lucide': 'calendar' }), ' Novedades & Festivos'
                ),
                isAuth && React.createElement(React.Fragment, null,
                    React.createElement('button', { className: `nav-tab admin-tab ${activeTab === 'admin' ? 'active' : ''}`, onClick: () => handleTabChange('admin') },
                        React.createElement('i', { 'data-lucide': 'shield-check' }), ' Mesa de Reporting'
                    ),
                    React.createElement('button', { className: `nav-tab admin-tab ${activeTab === 'vacaciones' ? 'active' : ''}`, onClick: () => handleTabChange('vacaciones') },
                        React.createElement('i', { 'data-lucide': 'plane' }), ' Vacaciones Admin'
                    ),
                    React.createElement('button', { className: `nav-tab analytics-tab ${activeTab === 'analytics' ? 'active' : ''}`, onClick: () => handleTabChange('analytics') },
                        React.createElement('i', { 'data-lucide': 'line-chart' }), ' Tiempos & KPIs'
                    )
                )
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                React.createElement('div', { className: `sync-badge-status ${isCloudOnline ? 'online' : 'offline'}` },
                    isCloudOnline ? '🟢 Nube Conectada' : '⚠️ Modo Local'
                ),
                !isAuth ? (
                    React.createElement('button', { className: 'btn-dn-accent', onClick: () => setActiveModalId('AUTH_MODAL') },
                        React.createElement('i', { 'data-lucide': 'lock' }), ' Acceso Reporting'
                    )
                ) : (
                    React.createElement('button', { className: 'btn-danger btn-sm', onClick: handleLogout },
                        React.createElement('i', { 'data-lucide': 'log-out' }), ' Salir'
                    )
                )
            )
        ),

        // Main Body Content
        React.createElement('main', { className: 'app-main-content' },
            // Tab Encoladas
            activeTab === 'encoladas' && React.createElement(EncoladasTabComponent, {
                requests,
                myIds,
                isAuth,
                setRequests,
                syncCloud,
                analystStatus,
                showToast,
                sendEmailNotification,
                handleDownload
            }),

            // Tab Reporting
            activeTab === 'reporting' && React.createElement(ReportingTabComponent, {
                requests,
                myIds,
                isAuth,
                setRequests,
                syncCloud,
                analystStatus,
                showToast,
                sendEmailNotification,
                handleDownload
            }),

            // Tab Novedades
            activeTab === 'novedades' && React.createElement(NovedadesTabComponent, { analystStatus }),

            // Tab Admin
            activeTab === 'admin' && React.createElement(AdminTabComponent, {
                requests,
                setRequests,
                syncCloud,
                analystStatus,
                setActiveModalId,
                showToast,
                handleDownload
            }),

            // Tab Vacaciones
            activeTab === 'vacaciones' && React.createElement(VacacionesTabComponent, {
                analystStatus,
                setAnalystStatus,
                syncCloud,
                requests,
                showToast
            }),

            // Tab Analytics
            activeTab === 'analytics' && React.createElement(AnalyticsTabComponent, { requests })
        ),

        // Modals & Toasts
        activeModalId === 'AUTH_MODAL' && React.createElement(AuthModalComponent, {
            onClose: () => setActiveModalId(null),
            onLogin: handleLogin
        }),

        activeModalId && activeModalId !== 'AUTH_MODAL' && React.createElement(ManageModalComponent, {
            req: requests.find(r => r.id === activeModalId),
            onClose: () => setActiveModalId(null),
            onSave: (updatedReq, type) => {
                const updatedList = requests.map(r => r.id === updatedReq.id ? updatedReq : r);
                setRequests(updatedList);
                syncCloud(updatedList, analystStatus);
                setActiveModalId(null);
                showToast('Solicitud actualizada correctamente.', 'success');
                sendEmailNotification(updatedReq, type);
            },
            handleDownload
        }),

        emailModal.isOpen && React.createElement(EmailModalComponent, {
            data: emailModal,
            onClose: () => setEmailModal({ isOpen: false, toEmail: '', subject: '', htmlBody: '' })
        }),

        React.createElement('div', { className: 'toast-wrapper' },
            toasts.map(t => React.createElement('div', { key: t.id, className: `toast-item ${t.type}` }, t.text))
        )
    );
}

// Sub-componentes React
function EncoladasTabComponent({ requests, myIds, isAuth, setRequests, syncCloud, analystStatus, showToast, sendEmailNotification, handleDownload }) {
    const [encType, setEncType] = useState('SPECIFIC_PDVS');
    const [email, setEmail] = useState('');
    const [estudio, setEstudio] = useState('KO moderno');
    const [pais, setPais] = useState('Colombia');
    const [ola, setOla] = useState('Julio 2026');
    const [pdvsText, setPdvsText] = useState('');
    const [solicitante, setSolicitante] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [fileName, setFileName] = useState(null);
    const [fileDataUrl, setFileDataUrl] = useState(null);

    const myEncoladas = requests.filter(r => r.category === 'ENCOLADA' && (myIds.includes(r.id) || isAuth));

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            if (isImageFilename(file.name)) {
                compressImageFile(file, url => setFileDataUrl(url));
            } else {
                const reader = new FileReader();
                reader.onload = ev => setFileDataUrl(ev.target.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFileName(null); setFileDataUrl(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isGen = encType === 'GENERAL';
        let pdvCodes = [];
        if (!isGen) {
            pdvCodes = pdvsText.split(/[\s,\n]+/).map(s => s.trim().toUpperCase()).filter(s => s.length > 0).map(s => s.startsWith('PDV-') ? s : 'PDV-' + s);
        }
        const newReq = {
            id: generateUniqueReqId(),
            category: 'ENCOLADA',
            isGeneralReview: isGen,
            pdvCodes,
            pdvCode: isGen ? 'Revisión General Estudio' : pdvCodes.join(', '),
            email: email.trim(),
            estudio, pais, ola,
            solicitante: solicitante.trim() || 'Operaciones D&N',
            analyst: null,
            detalle: observaciones.trim() || 'Sin observaciones.',
            fileName, fileDataUrl,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        recordMySubmittedId(newReq.id);
        const updated = [newReq, ...requests];
        setRequests(updated);
        syncCloud(updated, analystStatus);
        sendEmailNotification(newReq, 'SUBMISSION');

        setEmail(''); setPdvsText(''); setSolicitante(''); setObservaciones(''); setFileName(null); setFileDataUrl(null);
    };

    return React.createElement('div', { className: 'grid-2-cols' },
        React.createElement('div', { className: 'card-box' },
            React.createElement('div', { className: 'card-header' }, React.createElement('h2', null, '➕ Registrar Solicitud de Encolada')),
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement('div', { className: 'type-selector-box' },
                    React.createElement('div', { className: 'type-toggle-group' },
                        React.createElement('label', { className: 'radio-card' },
                            React.createElement('input', { type: 'radio', name: 'encType', checked: encType === 'SPECIFIC_PDVS', onChange: () => setEncType('SPECIFIC_PDVS') }),
                            React.createElement('span', { className: 'radio-content' }, 'PDVs Específicos')
                        ),
                        React.createElement('label', { className: 'radio-card' },
                            React.createElement('input', { type: 'radio', name: 'encType', checked: encType === 'GENERAL', onChange: () => setEncType('GENERAL') }),
                            React.createElement('span', { className: 'radio-content' }, 'Revisión General')
                        )
                    )
                ),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', null, 'Tu Correo Electrónico Corporativo *'),
                    React.createElement('input', { type: 'email', required: true, value: email, onChange: e => setEmail(e.target.value), placeholder: 'ejemplo@dichter-neira.com' })
                ),
                React.createElement('div', { className: 'form-row' },
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', null, 'Estudio *'),
                        React.createElement('select', { value: estudio, onChange: e => setEstudio(e.target.value) },
                            ['KO moderno', 'KO tradicional', 'Lindley', 'Heineken', 'Storelive', 'P&G', 'CBC', 'ABI', 'AJE', 'Otros'].map(s => React.createElement('option', { key: s, value: s }, s))
                        )
                    ),
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', null, 'País *'),
                        React.createElement('select', { value: pais, onChange: e => setPais(e.target.value) },
                            ['Colombia', 'Bolivia', 'Chile', 'Costa Rica', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana', 'Uruguay'].map(p => React.createElement('option', { key: p, value: p }, p))
                        )
                    )
                ),
                encType === 'SPECIFIC_PDVS' ? React.createElement('div', { className: 'form-group' },
                    React.createElement('label', null, 'PDVs Encolados *'),
                    React.createElement('textarea', { rows: 2, required: true, value: pdvsText, onChange: e => setPdvsText(e.target.value), placeholder: 'PDV-88412, PDV-77109' })
                ) : React.createElement('div', { className: 'info-alert-box', style: { marginBottom: 12 } }, 'Revisión General de todo el estudio.'),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', null, 'Adjuntar Foto o Excel'),
                    React.createElement('input', { type: 'file', onChange: handleFileChange }),
                    fileName && React.createElement('div', { style: { marginTop: 4 } },
                        isImageFilename(fileName) ? React.createElement('span', { className: 'file-attached-chip clickable' }, `🖼️ ${fileName}`) : React.createElement('span', { className: 'file-attached-chip email-badge' }, `📎 ${fileName} (Enviado al correo)`)
                    )
                ),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', null, 'Observaciones'),
                    React.createElement('textarea', { rows: 2, value: observaciones, onChange: e => setObservaciones(e.target.value) })
                ),
                React.createElement('button', { type: 'submit', className: 'btn-dn-primary full-width' }, 'Enviar Encolada')
            )
        ),

        React.createElement('div', { className: 'card-box' },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h2', null, '📜 Mis Encoladas Registradas'),
                React.createElement('span', { className: 'badge-total-encoladas' }, `${myEncoladas.length} items`)
            ),
            React.createElement('div', { className: 'feed-container' },
                myEncoladas.map(r => React.createElement('div', { className: 'item-card', key: r.id },
                    React.createElement('div', { className: 'item-top' },
                        React.createElement('strong', null, r.pdvCode),
                        React.createElement('span', { className: `chip-status ${r.status.toLowerCase()}` }, r.status)
                    ),
                    React.createElement('div', { style: { fontSize: '0.82rem', color: '#64748B' } }, `${r.estudio} (${r.pais})`),
                    r.fileName && React.createElement('div', { style: { marginTop: 4 } },
                        isImageFilename(r.fileName) ? (
                            React.createElement('button', { type: 'button', className: 'file-attached-chip clickable', onClick: () => handleDownload(r) }, `🖼️ ${r.fileName}`)
                        ) : (
                            React.createElement('span', { className: 'file-attached-chip email-badge', onClick: () => handleDownload(r) }, `📎 ${r.fileName} (Adjuntado al correo)`)
                        )
                    )
                ))
            )
        )
    );
}

function ReportingTabComponent({ requests, myIds, isAuth, setRequests, syncCloud, analystStatus, showToast, sendEmailNotification, handleDownload }) {
    const [biType, setBiType] = useState('EXISTING');
    const [email, setEmail] = useState('');
    const [estudio, setEstudio] = useState('KO moderno');
    const [pais, setPais] = useState('Colombia');
    const [usuario, setUsuario] = useState('');
    const [biName, setBiName] = useState('');
    const [detalle, setDetalle] = useState('');
    const [fileName, setFileName] = useState(null);
    const [fileDataUrl, setFileDataUrl] = useState(null);

    const myReqs = requests.filter(r => r.category.startsWith('BI_') && (myIds.includes(r.id) || isAuth));

    const handleFile = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            if (isImageFilename(file.name)) compressImageFile(file, url => setFileDataUrl(url));
            else {
                const reader = new FileReader();
                reader.onload = ev => setFileDataUrl(ev.target.result);
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newReq = {
            id: generateUniqueReqId(),
            category: biType === 'NEW' ? 'BI_NEW' : biType === 'SPORADIC' ? 'BI_SPORADIC' : 'BI_EXISTING',
            email: email.trim(), estudio, pais,
            solicitante: usuario.trim() || email.trim(),
            biNameToEdit: biName,
            detalle: detalle.trim(),
            fileName, fileDataUrl,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        recordMySubmittedId(newReq.id);
        const updated = [newReq, ...requests];
        setRequests(updated);
        syncCloud(updated, analystStatus);
        sendEmailNotification(newReq, 'SUBMISSION');

        setEmail(''); setUsuario(''); setBiName(''); setDetalle(''); setFileName(null); setFileDataUrl(null);
    };

    return React.createElement('div', { className: 'grid-2-cols' },
        React.createElement('div', { className: 'card-box' },
            React.createElement('div', { className: 'card-header' }, React.createElement('h2', null, '📊 Solicitud a Reporting Power BI')),
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement('div', { className: 'type-selector-box' },
                    React.createElement('div', { className: 'type-toggle-group three-cols' },
                        React.createElement('label', { className: 'radio-card' },
                            React.createElement('input', { type: 'radio', checked: biType === 'EXISTING', onChange: () => setBiType('EXISTING') }),
                            React.createElement('span', { className: 'radio-content' }, 'BI Existente')
                        ),
                        React.createElement('label', { className: 'radio-card' },
                            React.createElement('input', { type: 'radio', checked: biType === 'NEW', onChange: () => setBiType('NEW') }),
                            React.createElement('span', { className: 'radio-content' }, 'BI Nuevo')
                        ),
                        React.createElement('label', { className: 'radio-card' },
                            React.createElement('input', { type: 'radio', checked: biType === 'SPORADIC', onChange: () => setBiType('SPORADIC') }),
                            React.createElement('span', { className: 'radio-content' }, 'Esporádica')
                        )
                    )
                ),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', null, 'Tu Correo *'),
                    React.createElement('input', { type: 'email', required: true, value: email, onChange: e => setEmail(e.target.value) })
                ),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', null, 'Detalle del Requerimiento *'),
                    React.createElement('textarea', { rows: 3, required: true, value: detalle, onChange: e => setDetalle(e.target.value) })
                ),
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', null, 'Adjunto'),
                    React.createElement('input', { type: 'file', onChange: handleFile }),
                    fileName && React.createElement('div', { style: { marginTop: 4 } },
                        isImageFilename(fileName) ? React.createElement('span', { className: 'file-attached-chip clickable' }, `🖼️ ${fileName}`) : React.createElement('span', { className: 'file-attached-chip email-badge' }, `📎 ${fileName} (Enviado al correo)`)
                    )
                ),
                React.createElement('button', { type: 'submit', className: 'btn-dn-primary full-width' }, 'Enviar a Reporting')
            )
        ),

        React.createElement('div', { className: 'card-box' },
            React.createElement('div', { className: 'card-header' }, React.createElement('h2', null, '📜 Mis Solicitudes BI')),
            React.createElement('div', { className: 'feed-container' },
                myReqs.map(r => React.createElement('div', { className: 'item-card', key: r.id },
                    React.createElement('strong', null, r.category),
                    React.createElement('p', null, r.detalle),
                    r.fileName && React.createElement('div', { style: { marginTop: 4 } },
                        isImageFilename(r.fileName) ? (
                            React.createElement('button', { type: 'button', className: 'file-attached-chip clickable', onClick: () => handleDownload(r) }, `🖼️ ${r.fileName}`)
                        ) : (
                            React.createElement('span', { className: 'file-attached-chip email-badge', onClick: () => handleDownload(r) }, `📎 ${r.fileName} (Adjuntado al correo)`)
                        )
                    )
                ))
            )
        )
    );
}

function NovedadesTabComponent({ analystStatus }) {
    return React.createElement('div', { className: 'grid-2-cols' },
        React.createElement('div', { className: 'card-box' },
            React.createElement('div', { className: 'card-header' }, React.createElement('h2', null, '👥 Estado del Equipo Reporting')),
            analystStatus.map(a => React.createElement('div', { className: `analyst-status-card ${a.status === 'DISPONIBLE' ? 'available' : 'on-leave'}`, key: a.analyst },
                React.createElement('strong', null, a.analyst),
                React.createElement('p', null, a.note || '🟢 Laborando con normalidad.')
            ))
        )
    );
}

function AdminTabComponent({ requests, setRequests, syncCloud, analystStatus, setActiveModalId, showToast, handleDownload }) {
    return React.createElement('div', { className: 'card-box' },
        React.createElement('div', { className: 'card-header' }, React.createElement('h2', null, '🛡️ Mesa de Reporting Global')),
        React.createElement('div', { className: 'table-responsive-wrapper' },
            React.createElement('table', { className: 'admin-table' },
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', null, 'ID'),
                        React.createElement('th', null, 'Categoría'),
                        React.createElement('th', null, 'Estudio'),
                        React.createElement('th', null, 'País'),
                        React.createElement('th', null, 'Solicitante'),
                        React.createElement('th', null, 'Analista'),
                        React.createElement('th', null, 'Estado'),
                        React.createElement('th', null, 'Acciones')
                    )
                ),
                React.createElement('tbody', null,
                    requests.map(r => React.createElement('tr', { key: r.id },
                        React.createElement('td', null, r.id),
                        React.createElement('td', null, r.category),
                        React.createElement('td', null, r.estudio),
                        React.createElement('td', null, r.pais),
                        React.createElement('td', null, r.email || r.solicitante),
                        React.createElement('td', null, r.analyst || '--'),
                        React.createElement('td', null, r.status),
                        React.createElement('td', null,
                            React.createElement('button', { className: 'btn-secondary btn-sm', onClick: () => setActiveModalId(r.id) }, 'Gestionar')
                        )
                    ))
                )
            )
        )
    );
}

function VacacionesTabComponent({ analystStatus, setAnalystStatus, syncCloud, requests, showToast }) {
    const [analyst, setAnalyst] = useState('Juliana Chimbi');
    const [status, setStatus] = useState('VACACIONES');
    const [note, setNote] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const updated = analystStatus.map(a => a.analyst === analyst ? { ...a, status, note } : a);
        setAnalystStatus(updated);
        syncCloud(requests, updated);
        showToast(`Novedad actualizada para ${analyst}`);
    };

    return React.createElement('div', { className: 'card-box' },
        React.createElement('h2', null, '✈️ Gestión de Vacaciones'),
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('select', { value: analyst, onChange: e => setAnalyst(e.target.value) },
                React.createElement('option', { value: 'Mayumi Sanchez' }, 'Mayumi Sanchez'),
                React.createElement('option', { value: 'Juliana Chimbi' }, 'Juliana Chimbi')
            ),
            React.createElement('select', { value: status, onChange: e => setStatus(e.target.value) },
                React.createElement('option', { value: 'VACACIONES' }, 'Vacaciones'),
                React.createElement('option', { value: 'DISPONIBLE' }, 'Disponible')
            ),
            React.createElement('input', { placeholder: 'Nota', value: note, onChange: e => setNote(e.target.value) }),
            React.createElement('button', { type: 'submit', className: 'btn-dn-primary' }, 'Guardar Novedad')
        )
    );
}

function AnalyticsTabComponent({ requests }) {
    return React.createElement('div', { className: 'card-box' },
        React.createElement('h2', null, '📈 Tiempos & KPIs'),
        React.createElement('p', null, `Total de Solicitudes Registradas: ${requests.length}`)
    );
}

function AuthModalComponent({ onClose, onLogin }) {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    return React.createElement('div', { className: 'modal-backdrop active' },
        React.createElement('div', { className: 'modal-box' },
            React.createElement('h3', null, '🔒 Acceso Reporting'),
            React.createElement('form', { onSubmit: e => { e.preventDefault(); onLogin(u, p); } },
                React.createElement('input', { placeholder: 'Usuario', value: u, onChange: e => setU(e.target.value) }),
                React.createElement('input', { type: 'password', placeholder: 'Contraseña', value: p, onChange: e => setP(e.target.value) }),
                React.createElement('button', { type: 'submit', className: 'btn-dn-primary' }, 'Entrar')
            )
        )
    );
}

function ManageModalComponent({ req, onClose, onSave, handleDownload }) {
    const [analyst, setAnalyst] = useState(req?.analyst || 'Mayumi Sanchez');
    const [status, setStatus] = useState(req?.status || 'IN_PROGRESS');
    const [deliveryDate, setDeliveryDate] = useState(req?.deliveryDate || '');
    const [ticketNumber, setTicketNumber] = useState(req?.ticketNumber || '');

    if (!req) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...req, analyst, status, deliveryDate, ticketNumber }, status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'RESOLVED');
    };

    return React.createElement('div', { className: 'modal-backdrop active' },
        React.createElement('div', { className: 'modal-box' },
            React.createElement('h3', null, `Gestionar ${req.id}`),
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement('select', { value: analyst, onChange: e => setAnalyst(e.target.value) },
                    React.createElement('option', { value: 'Mayumi Sanchez' }, 'Mayumi Sanchez'),
                    React.createElement('option', { value: 'Juliana Chimbi' }, 'Juliana Chimbi')
                ),
                React.createElement('select', { value: status, onChange: e => setStatus(e.target.value) },
                    React.createElement('option', { value: 'IN_PROGRESS' }, '🔵 En Proceso'),
                    React.createElement('option', { value: 'RESOLVED' }, '🟢 Resuelto')
                ),
                status === 'IN_PROGRESS' && React.createElement('input', { type: 'date', value: deliveryDate, onChange: e => setDeliveryDate(e.target.value) }),
                status === 'RESOLVED' && React.createElement('input', { placeholder: 'Ticket TCK-DN', value: ticketNumber, onChange: e => setTicketNumber(e.target.value) }),
                React.createElement('button', { type: 'submit', className: 'btn-dn-primary' }, 'Guardar'),
                React.createElement('button', { type: 'button', className: 'btn-secondary', onClick: onClose }, 'Cancelar')
            )
        )
    );
}

function EmailModalComponent({ data, onClose }) {
    return React.createElement('div', { className: 'modal-backdrop active' },
        React.createElement('div', { className: 'modal-box' },
            React.createElement('h3', null, '📧 Notificación de Correo'),
            React.createElement('div', { dangerouslySetInnerHTML: { __html: data.htmlBody } }),
            React.createElement('button', { className: 'btn-dn-primary', onClick: onClose }, 'Cerrar')
        )
    );
}

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

