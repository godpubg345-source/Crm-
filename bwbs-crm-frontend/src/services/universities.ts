import api from './api';

// ============================================================================
// UNIVERSITIES SERVICE - BWBS Education CRM
// ============================================================================

export interface University {
    id: string;
    name: string;
    country: string;
    city?: string;
    ranking?: number;
    website?: string;
    logo_url?: string;
    is_active?: boolean;
}

export type CourseLevel = 'FOUNDATION' | 'UG' | 'PG' | 'PHD' | 'PRE_MASTERS' | 'DIPLOMA';
export type CourseCurrency = 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD';

export interface Course {
    id: string;
    university: string; // University ID
    name: string;
    level: CourseLevel;
    duration: string; // e.g., "1 Year", "2 Years"
    tuition_fee?: number;
    currency?: string;
    intake_months?: string; // e.g., "September, January"
    requirements?: string;
    is_active?: boolean;
    // Expanded fields
    university_name?: string;
    university_country?: string;
    university_logo?: string;
}

export interface IntakeCalendarCourse {
    id: string;
    name: string;
    university: string;
    level: string;
    deadline: string | null;
    tuition_fee: number;
}

export interface IntakeCalendarMonth {
    month: string;
    year: number;
    courses: IntakeCalendarCourse[];
}

export interface IntakeCalendarResponse {
    calendar: IntakeCalendarMonth[];
    total_intakes: number;
}

export interface IntakeCalendarParams {
    year?: number;
    month?: string;
    university?: string;
    level?: string;
}
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Filter Interfaces
export interface UniversityFilterParams {
    search?: string;
    country?: string;
    page?: number;
}

export interface CourseFilterParams {
    search?: string;
    country?: string;
    level?: string;
    min_price?: number;
    max_price?: number;
    university?: string;
    department?: string;
    ordering?: string;
    intake_jan?: boolean;
    intake_may?: boolean;
    intake_sep?: boolean;
    is_partner?: boolean;
    verified_only?: boolean;
    page?: number;
}

// ============================================================================
// GET ALL UNIVERSITIES
// ============================================================================
export const getUniversities = async (params: UniversityFilterParams = {}): Promise<PaginatedResponse<University>> => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.country) query.append('country', params.country);
    if (params.page) query.append('page', params.page.toString());

    const response = await api.get<PaginatedResponse<University>>(`/universities/?${query.toString()}`);
    return response.data;
};

// ============================================================================
// INTAKE CALENDAR
// ============================================================================
export const getIntakeCalendar = async (params: IntakeCalendarParams = {}): Promise<IntakeCalendarResponse> => {
    const query = new URLSearchParams();
    if (params.year) query.append('year', String(params.year));
    if (params.month) query.append('month', params.month);
    if (params.university) query.append('university', params.university);
    if (params.level) query.append('level', params.level);

    const response = await api.get<IntakeCalendarResponse>(`/universities/calendar/?${query.toString()}`);
    return response.data;
};

// ============================================================================
// GET UNIVERSITY BY ID
// ============================================================================
export const getUniversityById = async (id: string): Promise<University> => {
    const response = await api.get<University>(`/universities/${id}/`);
    return response.data;
};

// ============================================================================
// GET COURSES BY UNIVERSITY
// ============================================================================
export const getCoursesByUniversity = async (universityId: string): Promise<PaginatedResponse<Course>> => {
    const response = await api.get<PaginatedResponse<Course>>(`/courses/?university=${universityId}`);
    return response.data;
};

// ============================================================================
// GET ALL COURSES (with filters)
// ============================================================================
export const getCourses = async (params: CourseFilterParams = {}): Promise<PaginatedResponse<Course>> => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.country) query.append('university__country', params.country);
    if (params.level) query.append('level', params.level);
    if (params.min_price) query.append('tuition_fee__gte', params.min_price.toString());
    if (params.max_price) query.append('tuition_fee__lte', params.max_price.toString());
    if (params.university) query.append('university', params.university);
    if (params.department) query.append('department', params.department);
    if (params.ordering) query.append('ordering', params.ordering);
    if (params.intake_jan) query.append('intake_january', 'true');
    if (params.intake_may) query.append('intake_may', 'true');
    if (params.intake_sep) query.append('intake_september', 'true');
    if (params.is_partner) query.append('university__is_partner', 'true');
    if (params.verified_only) query.append('is_data_verified', 'true');
    if (params.page) query.append('page', params.page.toString());

    const response = await api.get<PaginatedResponse<Course>>(`/courses/?${query.toString()}`);
    return response.data;
};

// ============================================================================
// GET COURSE BY ID
// ============================================================================
export const getCourseById = async (id: string): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${id}/`);
    return response.data;
};

// ============================================================================
// SMART MATCHER
// ============================================================================

export interface SmartMatchCriteria {
    cgpa?: number;
    ielts?: number;
    study_gap?: number;
    target_country?: string;
}

export interface Scholarship {
    id: string;
    name: string;
    description?: string;
    amount_type: 'PERCENTAGE' | 'FIXED';
    value: number;
    amount_display: string;
    min_cgpa?: number;
    min_ielts?: number;
    deadline?: string;
}

export interface SmartMatchResult {
    id: string;
    name: string;
    logo?: string;
    country: string;
    country_display: string;
    city?: string;
    website?: string;
    is_partner: boolean;
    admission_criteria: {
        min_percentage: number;
        min_ielts: number;
        gap_limit: number;
        priority_rank: number;
        priority_badge: string;
        accepted_territories?: string[];
    };
    match_score: number;
    priority_badge: string;
    scholarships: Scholarship[];
}

export interface SmartMatchResponse {
    total_matches: number;
    showing: number;
    input: SmartMatchCriteria;
    results: SmartMatchResult[];
}

export const getSmartMatches = async (criteria: SmartMatchCriteria): Promise<SmartMatchResponse> => {
    const response = await api.post<SmartMatchResponse>('/universities/smart-match/', criteria);
    return response.data;
};

// ============================================================================
// PHASE 3-4: REVIEWS, CAREERS, QUICK APPLY, AI RECOMMENDATIONS
// ============================================================================

export interface CourseReview {
    id: string;
    course: string;
    course_name: string;
    user_name: string;
    overall_rating: number;
    teaching_quality?: number;
    career_prospects?: number;
    value_for_money?: number;
    course_content?: number;
    title?: string;
    review_text?: string;
    pros?: string;
    cons?: string;
    graduation_year?: number;
    is_verified: boolean;
    is_anonymous: boolean;
    helpful_count: number;
    created_at: string;
}

export interface CourseReviewStats {
    average_rating?: number;
    teaching_quality?: number;
    career_prospects?: number;
    value_for_money?: number;
    course_content?: number;
    total_reviews: number;
}

export interface CareerPath {
    id: string;
    name: string;
    sector: string;
    sector_display: string;
    description?: string;
    salary_min?: number;
    salary_max?: number;
    salary_median?: number;
    salary_range?: string;
    employment_rate?: number;
    growth_outlook: string;
    key_skills?: string;
    course_count: number;
}

export interface QuickApplyData {
    course: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    guest_country?: string;
    highest_qualification?: string;
    percentage?: number;
    ielts_score?: number;
    work_experience_years?: number;
    preferred_intake?: string;
    message?: string;
}

export interface AiRecommendationProfile {
    ielts_score: number;
    percentage: number;
    budget: number;
    country: string;
    preferred_level?: string;
    preferred_country?: string;
    has_work_experience?: boolean;
    work_exp_years?: number;
    interests?: string[];
}

export interface RecommendedCourse {
    id: string;
    name: string;
    university: string;
    university_country: string;
    level: string;
    tuition_fee: number;
    currency: string;
    duration: string;
    ielts_overall?: number;
    is_partner: boolean;
    match_score: number;
    match_percentage: number;
    reasons: string[];
    avg_rating?: number;
    review_count: number;
    career_paths: { name: string; salary_median?: number }[];
}

// Get reviews for a course
export const getCourseReviews = async (courseId: string): Promise<{
    stats: CourseReviewStats;
    distribution: Record<string, number>;
    reviews: CourseReview[];
}> => {
    const response = await api.get(`/course-reviews/course/${courseId}/`);
    return response.data;
};

// Submit a review
export const submitCourseReview = async (review: Partial<CourseReview>): Promise<CourseReview> => {
    const response = await api.post<CourseReview>('/course-reviews/', review);
    return response.data;
};

// Get career paths for a course
export const getCareerPaths = async (courseId?: string): Promise<CareerPath[]> => {
    if (courseId) {
        const response = await api.get<CareerPath[]>(`/career-paths/for-course/${courseId}/`);
        return response.data;
    }
    const response = await api.get<CareerPath[]>('/career-paths/');
    return response.data;
};

// Get top salary careers
export const getTopSalaryCareers = async (): Promise<CareerPath[]> => {
    const response = await api.get<CareerPath[]>('/career-paths/top-salaries/');
    return response.data;
};

// Submit quick apply
export const submitQuickApply = async (data: QuickApplyData): Promise<any> => {
    const response = await api.post('/quick-applies/', data);
    return response.data;
};

// Get AI recommendations
export const getAiRecommendations = async (profile: AiRecommendationProfile): Promise<{
    profile: AiRecommendationProfile;
    total_matches: number;
    recommendations: RecommendedCourse[];
    message: string;
}> => {
    const response = await api.post('/courses/recommendations/', profile);
    return response.data;
};

// ============================================================================
// ANALYTICS & INTELLIGENCE
// ============================================================================

export interface UniversityAnalyticsData {
    total_partners: number;
    total_universities: number;
    geographic_reach: { country: string; count: number }[];
    health_scores: any[];
}

export interface CommissionForecastData {
    summary: {
        total_earned: string;
        total_projected: string;
        total_forecast: string;
        partner_count: number;
    };
    pipeline: {
        pending: { count: number; projected: string; probability: string };
        offer: { count: number; projected: string; probability: string };
        cas_received: { count: number; projected: string; probability: string };
        enrolled: { count: number; earned: string; probability: string };
    };
    universities: any[]; // CommissionUniversity interface is in the component, can define here if needed
}

export const getUniversityAnalytics = async (): Promise<UniversityAnalyticsData> => {
    const response = await api.get<UniversityAnalyticsData>('/universities/analytics/');
    return response.data;
};

export const getCommissionForecast = async (): Promise<CommissionForecastData> => {
    const response = await api.get<CommissionForecastData>('/universities/commission-forecast/');
    return response.data;
};

export const getUniversityCommission = async (id: string): Promise<any> => {
    const response = await api.get(`/universities/${id}/commission/`);
    return response.data;
};

export const getUniversityApplications = async (id: string): Promise<any> => {
    const response = await api.get(`/universities/${id}/applications/`);
    return response.data;
};

export const getUniversityDocuments = async (id: string): Promise<any[]> => {
    const response = await api.get(`/universities/${id}/documents/`);
    return response.data;
};

export const getUniversityContacts = async (id: string): Promise<any[]> => {
    const response = await api.get(`/universities/${id}/contacts/`);
    return response.data;
};

export default {
    getUniversities,
    getUniversityById,
    getCoursesByUniversity,
    getCourses,
    getCourseById,
    getIntakeCalendar,
    getSmartMatches,
    getCourseReviews,
    submitCourseReview,
    getCareerPaths,
    getTopSalaryCareers,
    submitQuickApply,
    getAiRecommendations,
    getUniversityAnalytics,
    getCommissionForecast,
    getUniversityCommission,
    getUniversityApplications,
    getUniversityDocuments,
    getUniversityContacts
};

