/* ==========================================================================
   SERVICIO DE ALMACENAMIENTO LOCAL Y FILTRADO POR COMPUTADOR
   ========================================================================== */

import { PortalRequest, AnalystStatus } from '../types';

export const STORAGE_KEY = 'dn_portal_requests_v29';
export const NOVEDADES_KEY = 'dn_portal_novedades_v13';
export const REPORTING_SESSION_KEY = 'dn_portal_reporting_auth';
export const MY_REQUESTS_KEY = 'dn_portal_my_submitted_ids_v1';

export function getMySubmittedIds(): string[] {
    try {
        const raw = localStorage.getItem(MY_REQUESTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

export function recordMySubmittedId(id: string): void {
    try {
        const list = getMySubmittedIds();
        if (!list.includes(id)) {
            list.unshift(id);
            localStorage.setItem(MY_REQUESTS_KEY, JSON.stringify(list));
        }
    } catch (e) {
        console.error("Error al registrar id local:", e);
    }
}

export function loadRequestsFromStorage(): PortalRequest[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Error localStorage", e);
    }
    return [];
}

export function saveRequestsToStorage(requests: PortalRequest[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
        console.error("Error al guardar en localStorage", e);
    }
}

export function loadNovedadesFromStorage(): AnalystStatus[] {
    try {
        const raw = localStorage.getItem(NOVEDADES_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Error al cargar novedades de localStorage", e);
    }
    return [];
}

export function saveNovedadesToStorage(novedades: AnalystStatus[]): void {
    try {
        localStorage.setItem(NOVEDADES_KEY, JSON.stringify(novedades));
    } catch (e) {
        console.error("Error al guardar novedades en localStorage", e);
    }
}
