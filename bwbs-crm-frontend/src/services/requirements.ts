import api from './api';

export interface Requirement {
    id: string;
    name: string;
    description: string;
    is_mandatory: boolean;
    status?: string;
    origin_country?: string;
    notes?: string;
}

export const getVisaRequirements = async (destination: string, origin: string): Promise<Requirement[]> => {
    // Calling the endpoint /api/v1/requirements/check/
    // Assuming it accepts query params or body. Using POST usually for 'check', but GET with params is also common.
    // The instructions say "calling the endpoint /api/v1/requirements/check/". I'll use GET with params first as it's a fetch.
    const query = new URLSearchParams({
        country: destination,
        nationality: origin
    });

    const response = await api.get<Requirement[]>(`/requirements/check/?${query.toString()}`);
    return response.data.map((req) => ({
        ...req,
        description: req.description || req.name,
    }));
};

export default {
    getVisaRequirements,
};
