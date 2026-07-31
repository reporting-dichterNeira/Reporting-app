/* ==========================================================================
   REACT CONTEXT Y ESTADO GLOBAL DE LA APLICACIÓN (APPCONTEXT.TSX)
   ========================================================================== */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortalRequest, AnalystStatus, RequestCategory } from '../types';
import {
    fetchCloudDataFromApi,
    syncCloudDataToApi,
    mergeCloudRequests
} from '../services/cloudSyncService';
import {
    loadRequestsFromStorage,
    saveRequestsToStorage,
    loadNovedadesFromStorage,
    saveNovedadesToStorage,
    recordMySubmittedId,
    getMySubmittedIds,
    REPORTING_SESSION_KEY
} from '../services/storageService';

export interface ToastMessage {
    id: string;
    text: string;
    type: 'success' | 'info' | 'warning' | 'error';
}

export interface EmailPreviewModalState {
    isOpen: boolean;
    toEmail: string;
    subject: string;
    htmlBody: string;
}

export interface AppContextType {
    requests: PortalRequest[];
    analystStatus: AnalystStatus[];
    isReportingAuthenticated: boolean;
    activeTab: string;
    activeModalId: string | null;
    toasts: ToastMessage[];
    isCloudOnline: boolean;
    emailPreviewModal: EmailPreviewModalState;
    
    // Acciones
    setActiveTab: (tab: string) => void;
    loginReporting: (u: string, p: string) => boolean;
    logoutReporting: () => void;
    submitRequest: (req: PortalRequest) => Promise<void>;
    deleteRequest: (id: string) => void;
    saveModalResponse: (id: string, analyst: string, status: string, deliveryDate?: string, inProgressNote?: string, ticketNumber?: string, resolutionNote?: string) => void;
    submitNovedad: (analyst: string, status: any, dateStart?: string, dateEnd?: string, note?: string) => void;
    deleteNovedad: (index: number) => void;
    showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
    openModal: (id: string) => void;
    closeModal: () => void;
    closeEmailPreviewModal: () => void;
    openEmailPreviewModal: (toEmail: string, subject: string, htmlBody: string) => void;
    refreshCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<PortalRequest[]>(() => loadRequestsFromStorage());
    const [analystStatus, setAnalystStatus] = useState<AnalystStatus[]>(() => {
        const stored = loadNovedadesFromStorage();
        if (stored.length > 0) return stored;
        return [
            {
                analyst: 'Juliana Chimbi',
                status: 'VACACIONES',
                dateStart: '2026-08-15',
                dateEnd: '2026-08-25',
                dates: 'Del 15/08/2026 al 25/08/2026',
                note: '🏖️ En periodo de vacaciones. Durante estos días Mayumi Sanchez estará atendiendo y respaldando sus tareas.'
            }
        ];
    });

    const [isReportingAuthenticated, setIsReportingAuthenticated] = useState<boolean>(() => {
        return sessionStorage.getItem(REPORTING_SESSION_KEY) === 'true';
    });

    const [activeTab, setActiveTabState] = useState<string>('encoladas');
    const [activeModalId, setActiveModalId] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isCloudOnline, setIsCloudOnline] = useState<boolean>(true);
    const [emailPreviewModal, setEmailPreviewModal] = useState<EmailPreviewModalState>({
        isOpen: false,
        toEmail: '',
        subject: '',
        htmlBody: ''
    });

    // Guardar cambios en storage local
    useEffect(() => {
        saveRequestsToStorage(requests);
    }, [requests]);

    useEffect(() => {
        saveNovedadesToStorage(analystStatus);
    }, [analystStatus]);

    // Polling Cloud DB
    const refreshCloud = async () => {
        const cloudData = await fetchCloudDataFromApi();
        if (cloudData) {
            setIsCloudOnline(true);
            if (Array.isArray(cloudData.requests)) {
                setRequests(prev => mergeCloudRequests(prev, cloudData.requests));
            }
            if (Array.isArray(cloudData.analystStatus)) {
                setAnalystStatus(cloudData.analystStatus);
            }
        } else {
            setIsCloudOnline(false);
        }
    };

    useEffect(() => {
        refreshCloud();
        const interval = setInterval(refreshCloud, 4000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const setActiveTab = (tab: string) => {
        if ((tab === 'admin' || tab === 'vacaciones' || tab === 'analytics') && !isReportingAuthenticated) {
            setActiveModalId('AUTH_MODAL');
            return;
        }
        setActiveTabState(tab);
    };

    const loginReporting = (u: string, p: string): boolean => {
        const userClean = u.trim().toLowerCase();
        if ((userClean === 'reporting' || userClean.includes('reporting')) && p.trim() === 'rep123') {
            setIsReportingAuthenticated(true);
            sessionStorage.setItem(REPORTING_SESSION_KEY, 'true');
            setActiveModalId(null);
            setActiveTabState('admin');
            showToast('¡Desbloqueadas pestañas de Reporting, Vacaciones y Analytics!', 'success');
            return true;
        } else {
            showToast('Credenciales de Reporting incorrectas', 'warning');
            return false;
        }
    };

    const logoutReporting = () => {
        setIsReportingAuthenticated(false);
        sessionStorage.removeItem(REPORTING_SESSION_KEY);
        setActiveTabState('encoladas');
        showToast('Sesión de Reporting cerrada.', 'info');
    };

    const submitRequest = async (newReq: PortalRequest) => {
        recordMySubmittedId(newReq.id);
        const updated = [newReq, ...requests];
        setRequests(updated);
        await syncCloudDataToApi(updated, analystStatus);
    };

    const deleteRequest = (id: string) => {
        if (window.confirm(`¿Estás seguro de eliminar la solicitud ${id}?`)) {
            const updated = requests.filter(r => r.id !== id);
            setRequests(updated);
            syncCloudDataToApi(updated, analystStatus);
            showToast(`Solicitud ${id} eliminada correctamente.`, 'info');
        }
    };

    const saveModalResponse = (
        id: string,
        analyst: string,
        status: string,
        deliveryDate?: string,
        inProgressNote?: string,
        ticketNumber?: string,
        resolutionNote?: string
    ) => {
        const updated = requests.map(r => {
            if (r.id === id) {
                const copy = { ...r, analyst, status: status as any };
                if (status === 'IN_PROGRESS') {
                    copy.deliveryDate = deliveryDate;
                    copy.inProgressNote = inProgressNote;
                } else if (status === 'RESOLVED') {
                    copy.ticketNumber = ticketNumber;
                    copy.resolutionNote = resolutionNote;
                    copy.resolvedAt = copy.resolvedAt || new Date().toISOString();
                }
                return copy;
            }
            return r;
        });

        setRequests(updated);
        syncCloudDataToApi(updated, analystStatus);
        setActiveModalId(null);
        showToast('Estado de la solicitud actualizado correctamente.', 'success');
    };

    const submitNovedad = (analyst: string, status: any, dateStart?: string, dateEnd?: string, note?: string) => {
        let datesFormatted = 'Periodo actual';
        if (dateStart && dateEnd) {
            const d1 = new Date(dateStart + 'T00:00:00').toLocaleDateString('es-CO');
            const d2 = new Date(dateEnd + 'T00:00:00').toLocaleDateString('es-CO');
            datesFormatted = `Del ${d1} al ${d2}`;
        }

        const newStatus = {
            analyst,
            status,
            dateStart,
            dateEnd,
            dates: datesFormatted,
            note: note || ''
        };

        const existingIdx = analystStatus.findIndex(a => a.analyst === analyst);
        let updated: AnalystStatus[] = [];
        if (existingIdx !== -1) {
            updated = [...analystStatus];
            updated[existingIdx] = newStatus;
        } else {
            updated = [...analystStatus, newStatus];
        }

        setAnalystStatus(updated);
        syncCloudDataToApi(requests, updated);
        showToast(`Novedad publicada para ${analyst}`, 'success');
    };

    const deleteNovedad = (index: number) => {
        const item = analystStatus[index];
        if (item && window.confirm(`¿Estás seguro de eliminar el registro de vacaciones/novedad de ${item.analyst}?`)) {
            const updated = analystStatus.filter((_, idx) => idx !== index);
            setAnalystStatus(updated);
            syncCloudDataToApi(requests, updated);
            showToast('Novedad eliminada.', 'info');
        }
    };

    const openModal = (id: string) => setActiveModalId(id);
    const closeModal = () => setActiveModalId(null);

    const openEmailPreviewModal = (toEmail: string, subject: string, htmlBody: string) => {
        setEmailPreviewModal({ isOpen: true, toEmail, subject, htmlBody });
    };

    const closeEmailPreviewModal = () => {
        setEmailPreviewModal({ isOpen: false, toEmail: '', subject: '', htmlBody: '' });
    };

    return (
        <AppContext.Provider value={{
            requests,
            analystStatus,
            isReportingAuthenticated,
            activeTab,
            activeModalId,
            toasts,
            isCloudOnline,
            emailPreviewModal,
            setActiveTab,
            loginReporting,
            logoutReporting,
            submitRequest,
            deleteRequest,
            saveModalResponse,
            submitNovedad,
            deleteNovedad,
            showToast,
            openModal,
            closeModal,
            openEmailPreviewModal,
            closeEmailPreviewModal,
            refreshCloud
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp debe usarse dentro de AppProvider");
    return context;
};
