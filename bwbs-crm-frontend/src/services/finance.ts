import api from './api';

// ============================================================================
// FINANCE SERVICE - BWBS Education CRM
// ============================================================================

export interface Transaction {
    id: string;
    student: string; // Student ID
    fee_type: string | null; // FeeType ID
    amount: string; // Decimal string or number. Usually string in JSON for decimals.
    transaction_type?: 'CREDIT' | 'DEBIT';
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    created_at: string;
    updated_at: string;
    description?: string;
}

export interface TransactionCreateData {
    student: string; // Student ID
    fee_type?: string | null; // FeeType ID
    amount: number;
    transaction_type?: 'CREDIT' | 'DEBIT';
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    description?: string;
}

export interface FeeType {
    id: string;
    name: string;
    amount: string;
    is_active?: boolean;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ============================================================================
// GET TRANSACTIONS
// ============================================================================
export const getTransactions = async (studentId: string): Promise<PaginatedResponse<Transaction>> => {
    const params = new URLSearchParams();
    if (studentId) params.append('student', studentId);

    const response = await api.get<PaginatedResponse<Transaction>>(`/finance/transactions/?${params.toString()}`);
    return response.data;
};

// ============================================================================
// CREATE TRANSACTION
// ============================================================================
export const createTransaction = async (data: TransactionCreateData): Promise<Transaction> => {
    const response = await api.post<Transaction>('/finance/transactions/', data);
    return response.data;
};

// ============================================================================
// GET FEE TYPES
// ============================================================================
export const getFeeTypes = async (): Promise<FeeType[]> => {
    // Endpoint registered as /finance/fees/
    const response = await api.get<PaginatedResponse<FeeType> | FeeType[]>('/finance/fees/');
    const data = response.data;
    if ('results' in data) {
        return data.results;
    }
    return data;
};

// ============================================================================
// COMMISSIONS / CLAIMS
// ============================================================================

export type CommissionStatus = 'PENDING' | 'INVOICED' | 'RECEIVED' | 'REJECTED';

export interface CommissionClaim {
    id: string;
    application: string;
    application_details?: any; // Nested application, student, and course info
    university: string;
    university_details?: any;
    status_display: string;
    expected_amount: number;
    actual_amount_received: number | null;
    currency: string;
    status: CommissionStatus;
    invoice_date: string | null;
    payment_received_date: string | null;
    notes: string | null;
    created_at: string;
}

export interface CommissionFilterParams {
    status?: string;
    university?: string;
    student?: string;
    page?: number;
}

export const getClaims = async (params: CommissionFilterParams = {}): Promise<PaginatedResponse<CommissionClaim>> => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.university) query.append('university', params.university); // ID
    if (params.student) query.append('student', params.student);
    if (params.page) query.append('page', params.page.toString());

    const response = await api.get<PaginatedResponse<CommissionClaim>>(`/finance/commissions/?${query.toString()}`);
    return response.data;
};

export const updateClaimStatus = async (id: string, status: CommissionStatus, date?: string): Promise<CommissionClaim> => {
    const payload: Partial<CommissionClaim> = { status };
    if (status === 'INVOICED' && date) payload.invoice_date = date;
    if (status === 'RECEIVED' && date) payload.payment_received_date = date;

    const response = await api.patch<CommissionClaim>(`/finance/commissions/${id}/`, payload);
    return response.data;
};

export const downloadCommissionInvoice = async (id: string): Promise<Blob> => {
    const response = await api.get(`/finance/commissions/${id}/invoice/`, {
        responseType: 'blob',
    });
    return response.data;
};

export const commissionStatusColors: Record<CommissionStatus, string> = {
    PENDING: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    INVOICED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    RECEIVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export interface CommissionStats {
    projected_revenue: number;
    realized_revenue: number;
    pending_invoices: number;
}

export const getCommissionStats = async (): Promise<CommissionStats> => {
    const response = await api.get<CommissionStats>('/finance/commissions/stats/');
    return response.data;
};

export default {
    getTransactions,
    createTransaction,
    getFeeTypes,
    getClaims,
    updateClaimStatus,
    downloadCommissionInvoice,
    getCommissionStats,
};
