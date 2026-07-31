/* ==========================================================================
   SERVICIO DE SINCRONIZACIÓN EN LA NUBE (REST API JSONBLOB)
   ========================================================================== */

import { PortalRequest, AnalystStatus } from '../types';

export const SYNC_API_URL = 'https://jsonblob.com/api/jsonBlob/019fb398-a51c-79af-a1fd-c0095e6459fe';

export interface CloudPayload {
    requests: PortalRequest[];
    analystStatus: AnalystStatus[];
    lastUpdated: string;
}

export async function fetchCloudDataFromApi(): Promise<CloudPayload | null> {
    try {
        const resp = await fetch(SYNC_API_URL, { cache: 'no-store' });
        if (resp.ok) {
            const data: CloudPayload = await resp.json();
            return data;
        }
    } catch (e) {
        console.warn("Nube JSONBlob no disponible temporalmente:", e);
    }
    return null;
}

export async function syncCloudDataToApi(requests: PortalRequest[], analystStatus: AnalystStatus[]): Promise<boolean> {
    const sanitizedRequests = requests.map(r => {
        const copy = { ...r };
        if (copy.fileDataUrl && copy.fileDataUrl.length > 2500000) {
            copy.fileDataUrl = null;
        }
        return copy;
    });

    const payload: CloudPayload = {
        requests: sanitizedRequests,
        analystStatus: analystStatus,
        lastUpdated: new Date().toISOString()
    };

    try {
        const resp = await fetch(SYNC_API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const minReqs = requests.map(r => ({ ...r, fileDataUrl: null }));
            await fetch(SYNC_API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests: minReqs, analystStatus, lastUpdated: new Date().toISOString() })
            });
        }
        return true;
    } catch (e) {
        console.error("Error al publicar en la nube:", e);
        return false;
    }
}

export function mergeCloudRequests(localArr: PortalRequest[], cloudArr: PortalRequest[]): PortalRequest[] {
    if (!Array.isArray(cloudArr)) return localArr;
    const map = new Map<string, PortalRequest>();

    localArr.forEach(r => map.set(r.id, r));

    cloudArr.forEach(cloudReq => {
        if (!map.has(cloudReq.id)) {
            map.set(cloudReq.id, cloudReq);
        } else {
            const localReq = map.get(cloudReq.id)!;
            let bestFileUrl = cloudReq.fileDataUrl;
            if (localReq.fileDataUrl && (!cloudReq.fileDataUrl || localReq.fileDataUrl.length > cloudReq.fileDataUrl.length)) {
                bestFileUrl = localReq.fileDataUrl;
            }
            map.set(cloudReq.id, { ...cloudReq, ...localReq, fileDataUrl: bestFileUrl });
        }
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return merged;
}
