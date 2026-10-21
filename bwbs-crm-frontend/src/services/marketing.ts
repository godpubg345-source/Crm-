import api from './api';

export interface Campaign {
    id: string;
    name: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    channel: 'EMAIL' | 'WHATSAPP' | 'SMS';
    target_group: string;
    created_at: string;
    updated_at: string;
}

export interface CampaignStats {
    total_recipients: number;
    delivered: number;
    opened: number;
    clicked: number;
}

export const getCampaigns = async () => {
    // FIX: was '/campaigns/campaigns/' (404) — backend route is '/campaigns/'
    const response = await api.get('/campaigns/');
    return response.data;
};

export const getCampaignStats = async (id: string): Promise<CampaignStats> => {
    // FIX: was '/campaigns/campaigns/${id}/stats/' (404) — no stats action exists on backend;
    // falling back to campaign detail (caller currently unused)
    const response = await api.get(`/campaigns/${id}/`);
    return response.data;
};

export const createCampaign = async (data: Partial<Campaign>) => {
    // FIX: was '/campaigns/campaigns/' (404)
    const response = await api.post('/campaigns/', data);
    return response.data;
};

export default {
    getCampaigns,
    getCampaignStats,
    createCampaign
};
