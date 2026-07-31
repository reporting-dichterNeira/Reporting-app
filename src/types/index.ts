/* ==========================================================================
   PORTAL DICHTER & NEIRA - DEFINICIONES Y TIPOS TYPESCRIPT
   ========================================================================== */

export type RequestCategory = 'ENCOLADA' | 'BI_EXISTING' | 'BI_NEW' | 'BI_SPORADIC';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
export type AnalystStatusType = 'DISPONIBLE' | 'VACACIONES' | 'DIA_LIBRE' | 'CAPACITACION';

export interface PortalRequest {
    id: string;
    category: RequestCategory;
    email: string;
    estudio: string;
    pais: string;
    solicitante: string;
    detalle: string;
    analyst: string | null;
    status: RequestStatus;
    fileName?: string | null;
    fileDataUrl?: string | null;
    createdAt: string;
    resolvedAt?: string | null;
    ticketNumber?: string | null;
    resolutionNote?: string | null;
    deliveryDate?: string | null;
    inProgressNote?: string | null;

    // Campos específicos para Encoladas
    isGeneralReview?: boolean;
    pdvCodes?: string[];
    pdvCode?: string;
    ola?: string;

    // Campos específicos para Power BI
    usuario?: string;
    biNameToEdit?: string;
    frecuencia?: string;
    area?: string;
}

export interface AnalystStatus {
    analyst: 'Mayumi Sanchez' | 'Juliana Chimbi' | string;
    status: AnalystStatusType;
    dateStart?: string;
    dateEnd?: string;
    dates?: string;
    note?: string;
}

export interface ColombianHoliday {
    iso: string;
    dateLabel: string;
    day: string;
    name: string;
}

export interface AppState {
    requests: PortalRequest[];
    analystStatus: AnalystStatus[];
    isReportingAuthenticated: boolean;
    activeTab: 'encoladas' | 'reporting' | 'admin' | 'vacaciones' | 'analytics';
    activeModalId: string | null;
}
