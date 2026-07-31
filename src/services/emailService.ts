/* ==========================================================================
   SERVICIO DE CORREOS Y NOTIFICACIONES (EMAILJS)
   ========================================================================== */

import { PortalRequest } from '../types';

export const EMAILJS_SERVICE_ID = 'service_b1jhrai';
export const EMAILJS_TEMPLATE_ID = 'template_cpy03f3';
export const EMAILJS_PUBLIC_KEY = 'OfXawgXmm_YWqDj4B';

export const REPORTING_TEAM_EMAILS = [
    'masanchez@dichter-neira.com',
    'jchimbi@dichter-neira.com'
];

export interface EmailData {
    recipientsStr: string;
    subject: string;
    htmlBody: string;
}

export function buildSubmissionEmailData(req: PortalRequest): EmailData {
    const userEmail = req.email || 'usuario@dichter-neira.com';
    const isEncolada = req.category === 'ENCOLADA';
    const isImage = !!req.fileName?.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);

    const allRecipients = [userEmail, ...REPORTING_TEAM_EMAILS];
    const recipientsStr = allRecipients.join(', ');

    let catTitle = 'Reporting Power BI';
    if (req.category === 'ENCOLADA') catTitle = 'Encolada PDV';
    else if (req.category === 'BI_SPORADIC') catTitle = 'Solicitud Esporádica';

    const subject = `[Nueva Solicitud ${req.id}] ${catTitle}: ${req.estudio} (${req.pais})`;

    const commitmentMsg = isEncolada
        ? '⏳ <strong>La solicitud se revisará en un máximo de 2 días hábiles (Equipo ubicado en Colombia).</strong>'
        : '⏳ <strong>El equipo de Reporting (Colombia) se contactará en un plazo máximo de 3 días hábiles.</strong>';

    let attachmentHtmlNote = '';
    if (req.fileName) {
        if (isImage) {
            attachmentHtmlNote = `<div><strong>Imagen Adjunta:</strong> 🖼️ ${req.fileName} (Descargable directamente desde el portal)</div>`;
        } else {
            attachmentHtmlNote = `<div style="color:#0D5CAB; font-weight:700;"><strong>Archivo Adjunto al Correo:</strong> 📎 ${req.fileName} (Consulte el archivo adjunto a esta notificación de correo)</div>`;
        }
    }

    const htmlBody = `
        <p>Hola <strong>${req.solicitante || 'Equipo Dichter & Neira'}</strong>,</p>
        <p>Se ha recibido correctamente una nueva solicitud en el Portal de Dichter & Neira.</p>
        
        <div style="background:rgba(13,92,171,0.08); border-left:4px solid #0D5CAB; padding:14px; margin:14px 0; border-radius:6px; font-size:0.9rem;">
            ${commitmentMsg}
        </div>

        <div class="email-card-box">
            <div><strong>Folio ID:</strong> ${req.id}</div>
            <div><strong>Solicitante:</strong> ${req.solicitante} (${req.email})</div>
            <div><strong>Categoría:</strong> ${req.category}</div>
            <div><strong>Estudio:</strong> ${req.estudio} | <strong>País:</strong> ${req.pais}</div>
            ${req.pdvCode ? `<div><strong>Detalle / PDVs:</strong> ${req.pdvCode}</div>` : ''}
            ${attachmentHtmlNote}
            <div><strong>Detalle del Requerimiento:</strong> "${req.detalle}"</div>
        </div>

        <p style="font-size:0.8rem; color:#64748B;">Notificación enviada a: ${recipientsStr}</p>
    `;

    return { recipientsStr, subject, htmlBody };
}

export function buildInProgressEmailData(req: PortalRequest): EmailData {
    const userEmail = req.email || 'usuario@dichter-neira.com';
    const allRecipients = [userEmail, ...REPORTING_TEAM_EMAILS];
    const recipientsStr = allRecipients.join(', ');

    const subject = `[En Proceso] Actualización Solicitud ${req.id} - Fecha de Entrega Acordada`;
    const deliveryFormatted = req.deliveryDate ? new Date(req.deliveryDate + 'T00:00:00').toLocaleDateString('es-CO') : 'Por acordar';

    const htmlBody = `
        <p>Hola <strong>${req.solicitante || 'Solicitante'}</strong>,</p>
        <p>La solicitud <strong>${req.id}</strong> ha sido revisada por la analista <strong>${req.analyst}</strong> de Reporting y ha pasado a estado <strong>🔵 EN PROCESO</strong>.</p>
        
        <div style="background:rgba(51,189,238,0.12); border-left:4px solid #0D5CAB; padding:16px; margin:14px 0; border-radius:6px;">
            <div style="font-size:0.95rem; font-weight:700; color:#0D5CAB; margin-bottom:6px;">
                📅 Según la conversación sostenida, la fecha estimada de entrega es: <strong>${deliveryFormatted}</strong>
            </div>
            <div style="font-size:0.85rem; color:#1E293B;">
                <strong>Detalles del Acuerdo:</strong> "${req.inProgressNote || 'En proceso de desarrollo y conciliación.'}"
            </div>
        </div>

        <div class="email-card-box">
            <div><strong>Solicitud ID:</strong> ${req.id}</div>
            <div><strong>Analista Asignada:</strong> ${req.analyst}</div>
            <div><strong>Estudio:</strong> ${req.estudio} | <strong>País:</strong> ${req.pais}</div>
        </div>
    `;

    return { recipientsStr, subject, htmlBody };
}

export function buildResolutionEmailData(req: PortalRequest): EmailData {
    const userEmail = req.email || 'usuario@dichter-neira.com';
    const allRecipients = [userEmail, ...REPORTING_TEAM_EMAILS];
    const recipientsStr = allRecipients.join(', ');

    const subject = `[Ticket Asignado] Solución Solicitud ${req.id} - D&N`;

    const htmlBody = `
        <p>Hola <strong>${req.solicitante || 'Solicitante'}</strong>,</p>
        <p>La solicitud <strong>${req.id}</strong> ha sido atendida y completada exitosamente por la analista <strong>${req.analyst}</strong> de Reporting:</p>
        <div class="email-ticket-highlight">
            <span style="font-size:0.75rem; color:#64748B;">Número de Ticket Generado</span>
            <div class="ticket-code-big">${req.ticketNumber}</div>
        </div>
        <div class="email-card-box">
            <div><strong>Analista Asignada:</strong> ${req.analyst}</div>
            <div><strong>Respuesta / Nota:</strong> "${req.resolutionNote || 'Solicitud completada exitosamente.'}"</div>
        </div>
    `;

    return { recipientsStr, subject, htmlBody };
}

export function triggerEmailJsSend(emailData: EmailData, req: PortalRequest): void {
    const win = window as any;
    if (typeof win.emailjs !== 'undefined') {
        const recipients = emailData.recipientsStr.split(', ');
        recipients.forEach(email => {
            const templateParams = {
                to_email: email,
                subject: emailData.subject,
                message: emailData.htmlBody,
                name: 'Reporting Dichter & Neira',
                content_attachment: req.fileDataUrl || '',
                file_name: req.fileName || ''
            };
            win.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        });
    }
}
