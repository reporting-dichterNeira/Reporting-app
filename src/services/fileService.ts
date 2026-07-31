/* ==========================================================================
   SERVICIO DE MANEJO DE ARCHIVOS Y COMPRESIÓN DE IMÁGENES
   ========================================================================== */

import { PortalRequest } from '../types';

export function isImageFilename(filename?: string | null): boolean {
    if (!filename) return false;
    return !!filename.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);
}

export function compressImageFile(file: File, callback: (compressedDataUrl: string) => void): void {
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
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                callback(compressedDataUrl);
            } else {
                callback(e.target?.result as string);
            }
        };
        img.onerror = function() {
            callback(e.target?.result as string);
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
}

export function dataURLtoBlob(dataurl: string): Blob | null {
    if (!dataurl || typeof dataurl !== 'string' || !dataurl.includes(',')) return null;
    try {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error al convertir DataURL a Blob:", e);
        return null;
    }
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function generateFallbackImageBlob(req: PortalRequest, callback: (blob: Blob) => void): void {
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

    canvas.toBlob(blob => {
        if (blob) callback(blob);
    }, 'image/png');
}
