import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    GraduationCap,
    Building2,
    DollarSign,
    MapPin,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Calendar,
    Award,
    Loader2,
    Sparkles,
    Heart,
    GitCompare,
    Calculator,
    X,
    TrendingDown,
    TrendingUp,
    Minus,
    Bookmark,
    Send,
    Star,
    Gift
} from 'lucide-react';
import api from '../services/api';

// ==================== INTERFACES ====================
interface Course {
    id: number;
    name: string;
    university_name: string;
    university_city?: string;
    university_country?: string;
    university_logo?: string;
    is_partner?: boolean;
    level: string;
    level_display?: string;
    duration?: string;
    tuition_fee: number;
    currency: string;
    intakes?: string;
    ielts_overall?: number;
    ielts_each_band?: number;
    intake_january?: boolean;
    intake_may?: boolean;
    intake_september?: boolean;
    official_url?: string;
    is_data_verified?: boolean;
    // Phase 3-4 fields
    avg_rating?: number;
    review_count?: number;
    career_paths?: {
        name: string;
        sector: string;
        sector_display?: string;
        description?: string;
        salary_min?: number;
        salary_max?: number;
        salary_median?: number;
        growth_outlook?: string;
        key_skills?: string;
    }[];
    // Eligibility fields for smart match results
    match_score?: number;
    eligibility_status?: 'eligible' | 'conditional' | 'ineligible';
    issues?: string[];
    // Phase 5 fields
    matching_scholarship?: {
        name: string;
        value: number;
        amount_type: string;
        potential_savings: number;
    };
    total_savings?: number;
}

interface EligibilityResult extends Course {
    match_score: number;
    eligibility_status: 'eligible' | 'conditional' | 'ineligible';
    issues: string[];
    country_requirements?: string;
}

interface CourseStats {
    total_courses: number;
    average_fee: number;
    fee_range: { min: number; max: number };
    average_ielts: number;
    partner_courses: number;
    verified_courses: number;
    by_level: { level: string; count: number }[];
}

interface ComparisonCourse {
    id: number;
    name: string;
    university_name: string;
    university_city: string;
    university_country: string;
    is_partner: boolean;
    level: string;
    duration: string;
    tuition_fee: number;
    currency: string;
    ielts_overall: number | null;
    ielts_each_band: number | null;
    intakes: string;
    indicators: {
        best_fee: boolean;
        worst_fee: boolean;
        easiest_ielts: boolean;
        hardest_ielts: boolean;
        is_partner: boolean;
    };
}

interface CostBreakdown {
    course: { id: number; name: string; university: string; city: string };
    breakdown: {
        tuition: { gbp: number; converted: number };
        living_costs: { monthly_gbp: number; total_gbp: number; converted: number };
        visa_fee: { gbp: number; converted: number };
        health_surcharge: { gbp: number; converted: number };
    };
    grand_total: { gbp: number; converted: number; currency: string };
    duration_years: number;
    exchange_rate: number;
}

// ==================== MAIN COMPONENT ====================
const CourseFinder: React.FC = () => {
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        minFee: '',
        maxFee: '',
        level: '',
        country: '',
        maxIelts: '',
        university: '',
        department: '',
        intakeJan: false,
        intakeMay: false,
        intakeSep: false,
        isPartner: false,
        verifiedOnly: false
    });

    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('name');
    const [totalResults, setTotalResults] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [universities, setUniversities] = useState<{ id: string, name: string }[]>([]);

    // Eligibility state
    const [eligibilityProfile, setEligibilityProfile] = useState({
        country: 'PK',
        ielts_score: 6.0,
        percentage: 60,
        has_work_exp: false,
        work_exp_years: 0,
        level: 'PG',
        max_fee: 25000,
        intake: 'sep'
    });
    const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);
    const [matchLoading, setMatchLoading] = useState(false);

    // Stats state
    const [stats, setStats] = useState<CourseStats | null>(null);

    // Compare state
    const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [comparisonData, setComparisonData] = useState<ComparisonCourse[]>([]);
    const [compareLoading, setCompareLoading] = useState(false);

    // Wishlist state
    const [wishlist, setWishlist] = useState<Set<number>>(new Set());
    // Cost Calculator state
    const [showCostModal, setShowCostModal] = useState(false);
    const [selectedCourseForCost, setSelectedCourseForCost] = useState<Course | null>(null);
    const [costData, setCostData] = useState<CostBreakdown | null>(null);
    const [costLoading, setCostLoading] = useState(false);
    const [costCurrency, setCostCurrency] = useState('PKR');
    const [costDuration, setCostDuration] = useState(1);

    // Quick Apply state
    const [quickApplyCourse, setQuickApplyCourse] = useState<Course | null>(null);
    const [quickApplyLoading, setQuickApplyLoading] = useState(false);
    const [quickApplyForm, setQuickApplyForm] = useState({
        preferred_intake: 'Sep 2025',
        message: ''
    });

    // AI Recommendations state
    const [aiRecommendations, setAiRecommendations] = useState<Course[]>([]);
    const [aiLoading, setAiLoading] = useState(false);

    // Scholarship Modal state
    const [showScholarshipModal, setShowScholarshipModal] = useState(false);
    const [selectedCourseForScholarship, setSelectedCourseForScholarship] = useState<Course | null>(null);

    // Course Review state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedCourseForReview, setSelectedCourseForReview] = useState<Course | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        overall_rating: 5,
        teaching_quality: 5,
        career_prospects: 5,
        value_for_money: 5,
        course_content: 5,
        title: '',
        review_text: '',
        pros: '',
        cons: ''
    });

    // Career Path Modal state
    interface CareerPath {
        name: string;
        sector: string;
        sector_display?: string;
        description?: string;
        salary_min?: number;
        salary_max?: number;
        salary_median?: number;
        growth_outlook?: string;
        key_skills?: string;
    }
    const [showCareerModal, setShowCareerModal] = useState(false);
    const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);



    // Active Tab
    const [activeTab, setActiveTab] = useState<'search' | 'eligibility' | 'wishlist'>('search');

    // Fetch stats, wishlist and universities on mount
    useEffect(() => {
        fetchStats();
        fetchWishlist();
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            const response = await api.get('/universities/');
            // Handle both paginated and non-paginated responses
            const data = response.data.results || response.data;
            setUniversities(data.map((u: any) => ({ id: u.id, name: u.name })));
        } catch (error) {
            console.error('Failed to fetch universities:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/courses/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/wishlists/');
            const ids = new Set<number>(response.data.map((w: { course: number }) => w.course));
            setWishlist(ids);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseForReview) return;

        setReviewLoading(true);
        try {
            await api.post('/course-reviews/', {
                course: selectedCourseForReview.id,
                ...reviewForm
            });
            setShowReviewModal(false);
            // Reset form
            setReviewForm({
                overall_rating: 5,
                teaching_quality: 5,
                career_prospects: 5,
                value_for_money: 5,
                course_content: 5,
                title: '',
                review_text: '',
                pros: '',
                cons: ''
            });
            // Refresh courses to see updated stats
            handleSearch();
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please ensure you are logged in.');
        } finally {
            setReviewLoading(false);
        }
    };

    const handleSearch = async (pageNum: number = 1, append: boolean = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filters.minFee) params.append('min_fee', filters.minFee);
            if (filters.maxFee) params.append('max_fee', filters.maxFee);
            if (filters.level) params.append('level', filters.level);
            if (filters.country) params.append('university__country', filters.country);
            if (filters.maxIelts) params.append('max_ielts', filters.maxIelts);
            if (filters.university) params.append('university', filters.university);
            if (filters.department) params.append('department', filters.department);
            if (filters.intakeJan) params.append('intake_january', 'true');
            if (filters.intakeMay) params.append('intake_may', 'true');
            if (filters.intakeSep) params.append('intake_september', 'true');
            if (filters.isPartner) params.append('university__is_partner', 'true');
            if (filters.verifiedOnly) params.append('is_data_verified', 'true');

            if (sortBy) params.append('ordering', sortBy);
            params.append('page', pageNum.toString());

            const response = await api.get(`/courses/?${params.toString()}`);
            const newCourses = response.data.results || [];

            if (append) {
                setCourses(prev => [...prev, ...newCourses]);
            } else {
                setCourses(newCourses);
            }

            setTotalResults(response.data.count || newCourses.length);
            setHasNextPage(!!response.data.next);
            setPage(pageNum);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (hasNextPage && !loading) {
            handleSearch(page + 1, true);
        }
    };

    // Trigger search when query or filters change (reset to page 1)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'search') {
                handleSearch(1, false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters, sortBy, activeTab]);

    const handleEligibilityMatch = async () => {
        setMatchLoading(true);
        try {
            const response = await api.post('/courses/eligibility-match/', eligibilityProfile);
            setEligibilityResults(response.data.courses);
        } catch (error) {
            console.error('Eligibility match failed:', error);
        } finally {
            setMatchLoading(false);
        }
    };

    const fetchAiRecommendations = async () => {
        setAiLoading(true);
        try {
            const response = await api.post('/courses/recommendations/', eligibilityProfile);
            setAiRecommendations(response.data.recommendations || []);
        } catch (error) {
            console.error('AI Recommendations failed:', error);
        } finally {
            setAiLoading(false);
        }
    };


    // ==================== COMPARE FUNCTIONS ====================
    const toggleCompare = (courseId: number) => {
        setSelectedForCompare(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            }
            if (prev.length >= 4) return prev; // Max 4
            return [...prev, courseId];
        });
    };

    const handleCompare = async () => {
        if (selectedForCompare.length < 2) return;
        setCompareLoading(true);
        try {
            const response = await api.get(`/courses/compare/?ids=${selectedForCompare.join(',')}`);
            setComparisonData(response.data.courses);
            setShowCompareModal(true);
        } catch (error) {
            console.error('Compare failed:', error);
        } finally {
            setCompareLoading(false);
        }
    };

    // ==================== WISHLIST FUNCTIONS ====================
    const toggleWishlist = async (courseId: number) => {
        try {
            await api.post('/wishlists/toggle/', { course_id: courseId });
            setWishlist(prev => {
                const next = new Set(prev);
                if (next.has(courseId)) {
                    next.delete(courseId);
                } else {
                    next.add(courseId);
                }
                return next;
            });
        } catch (error) {
            console.error('Toggle wishlist failed:', error);
        }
    };

    // ==================== COST CALCULATOR FUNCTIONS ====================
    const openCostCalculator = (course: Course) => {
        setSelectedCourseForCost(course);
        setShowCostModal(true);
        calculateCost(course.id, costDuration, costCurrency);
    };

    const calculateCost = useCallback(async (courseId: number, duration: number, currency: string) => {
        setCostLoading(true);
        try {
            const response = await api.post('/living-costs/calculate/', {
                course_id: courseId,
                duration_years: duration,
                currency: currency
            });
            setCostData(response.data);
        } catch (error) {
            console.error('Cost calculation failed:', error);
        } finally {
            setCostLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCourseForCost && showCostModal) {
            calculateCost(selectedCourseForCost.id, costDuration, costCurrency);
        }
    }, [costDuration, costCurrency, selectedCourseForCost, showCostModal, calculateCost]);

    // ==================== HELPER FUNCTIONS ====================
    const getEligibilityBadge = (status: string, score: number) => {
        if (status === 'eligible') {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle2 size={12} />
                    <span>Eligible • {score}%</span>
                </div>
            );
        } else if (status === 'conditional') {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <AlertCircle size={12} />
                    <span>Conditional • {score}%</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <XCircle size={12} />
                    <span>Ineligible</span>
                </div>
            );
        }
    };

    const formatCurrency = (amount: number, currency: string = 'GBP') => {
        const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', PKR: 'Rs', INR: '₹', BDT: '৳' };
        return `${symbols[currency] || currency}${amount.toLocaleString()}`;
    };

    // ==================== COURSE CARD COMPONENT ====================
    const CourseCard = ({ course, showActions = true }: { course: Course; showActions?: boolean }) => (
        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{course.name}</h3>
                        {course.is_partner && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Partner
                            </span>
                        )}
                        {course.is_data_verified && (
                            <CheckCircle2 size={14} className="text-green-500" />
                        )}
                        {course.review_count !== undefined && course.review_count > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-100 ml-auto shrink-0">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-bold text-amber-900">
                                    {course.avg_rating?.toFixed(1) || course.avg_rating || '0.0'}
                                </span>
                                <span className="text-[10px] text-amber-500/70">({course.review_count})</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <Building2 size={14} />
                            {course.university_name}
                        </span>
                        {course.university_city && (
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {course.university_city}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {course.intakes || 'Sep'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(course.tuition_fee, course.currency)}
                    </p>
                    {course.ielts_overall && (
                        <p className="text-sm text-gray-600">IELTS {course.ielts_overall}</p>
                    )}
                    {course.match_score !== undefined && (
                        <div className="mt-2 text-right">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-auto">
                                <div
                                    className={`h-full rounded-full ${course.match_score >= 75 ? 'bg-emerald-500' :
                                        course.match_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                    style={{ width: `${course.match_score}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">{course.match_score}% match</p>
                        </div>
                    )}
                    {course.total_savings && course.total_savings > 0 && (
                        <div className="mt-2 text-right">
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Est. Savings</p>
                            <p className="text-sm font-bold text-green-600">
                                -{formatCurrency(course.total_savings, course.currency)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {course.eligibility_status && getEligibilityBadge(course.eligibility_status, course.match_score || 0)}

                {course.matching_scholarship && (
                    <button
                        onClick={() => {
                            setSelectedCourseForScholarship(course);
                            setShowScholarshipModal(true);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 animate-pulse hover:bg-green-100 transition-colors"
                    >
                        <Gift size={10} />
                        <span>Matching Scholarship</span>
                    </button>
                )}

                {course.issues && course.issues.length > 0 && (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        {course.issues.length} {course.issues.length === 1 ? 'Condition' : 'Conditions'}
                    </span>
                )}
            </div>

            {course.issues && course.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                    {course.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-500">
                            <span className="text-amber-500 shrink-0">•</span>
                            <span>{issue}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                        {course.level_display || course.level}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {course.duration || '1 Year'}
                    </span>
                    {course.career_paths && course.career_paths.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {course.career_paths.slice(0, 2).map((career, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSelectedCareer(career as any);
                                        setShowCareerModal(true);
                                    }}
                                    className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded font-bold border border-indigo-100 flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                                >
                                    <TrendingUp size={10} />
                                    {career.name}
                                    {career.salary_median && (
                                        <span className="text-slate-400 font-normal">
                                            (£{(career.salary_median / 1000).toFixed(0)}k)
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {showActions && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleWishlist(course.id)}
                            className={`p-2 rounded-lg transition-colors ${wishlist.has(course.id)
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                                }`}
                            title={wishlist.has(course.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart size={16} fill={wishlist.has(course.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={() => toggleCompare(course.id)}
                            className={`p-2 rounded-lg transition-colors ${selectedForCompare.includes(course.id)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500'
                                }`}
                            title={selectedForCompare.includes(course.id) ? 'Remove from comparison' : 'Add to comparison'}
                        >
                            <GitCompare size={16} />
                        </button>
                        <button
                            onClick={() => openCostCalculator(course)}
                            className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-500 transition-colors"
                            title="Calculate total cost"
                        >
                            <Calculator size={16} />
                        </button>
                        {course.official_url && (
                            <a
                                href={course.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-500 transition-colors"
                                title="Visit course page"
                            >
                                <ExternalLink size={16} />
                            </a>
                        )}
                        <button
                            onClick={() => {
                                setSelectedCourseForReview(course);
                                setShowReviewModal(true);
                            }}
                            className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500 transition-colors"
                            title="Write a review"
                        >
                            <Star size={16} />
                        </button>
                        <button
                            onClick={() => setQuickApplyCourse(course)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"
                            title="Quick Apply"
                        >
                            <Send size={14} />
                            Apply
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="text-blue-600" />
                    Course Finder
                </h1>
                <p className="text-gray-600">Search, compare, and calculate costs for courses</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Courses</p>
                                <p className="text-xl font-bold">{stats.total_courses.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Building2 className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Partner Courses</p>
                                <p className="text-xl font-bold">{stats.partner_courses.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg. Fee</p>
                                <p className="text-xl font-bold">{formatCurrency(stats.average_fee)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Award className="text-orange-600" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg. IELTS</p>
                                <p className="text-xl font-bold">{stats.average_ielts}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Heart className="text-red-600" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">My Wishlist</p>
                                <p className="text-xl font-bold">{wishlist.size}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'search'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border hover:bg-gray-50'
                        }`}
                >
                    <Search size={16} className="inline mr-2" />
                    Search Courses
                </button>
                <button
                    onClick={() => setActiveTab('eligibility')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'eligibility'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-600 border hover:bg-gray-50'
                        }`}
                >
                    <Sparkles size={16} className="inline mr-2" />
                    Smart Match
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'wishlist'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-600 border hover:bg-gray-50'
                        }`}
                >
                    <Bookmark size={16} className="inline mr-2" />
                    My Wishlist ({wishlist.size})
                </button>
            </div>

            {/* Floating Compare Bar */}
            {selectedForCompare.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-40">
                    <GitCompare size={20} />
                    <span className="font-medium">{selectedForCompare.length} courses selected</span>
                    <button
                        onClick={handleCompare}
                        disabled={selectedForCompare.length < 2 || compareLoading}
                        className="px-4 py-1 bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 disabled:opacity-50"
                    >
                        {compareLoading ? <Loader2 className="animate-spin" size={16} /> : 'Compare Now'}
                    </button>
                    <button
                        onClick={() => setSelectedForCompare([])}
                        className="p-1 hover:bg-blue-500 rounded-full"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search courses, universities, or departments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch(1, false)}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="w-48">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full h-full px-4 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            >
                                <option value="name">Name (A-Z)</option>
                                <option value="-name">Name (Z-A)</option>
                                <option value="tuition_fee">Price (Low-High)</option>
                                <option value="-tuition_fee">Price (High-Low)</option>
                                <option value="-ielts_overall">IELTS (High-Low)</option>
                                <option value="ielts_overall">IELTS (Low-High)</option>
                                <option value="-created_at">Newly Added</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-gray-50'}`}
                        >
                            <Filter size={20} />
                            Advanced
                            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                            onClick={() => handleSearch(1, false)}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                            Search
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-white border rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                    <select
                                        value={filters.level}
                                        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="">All Levels</option>
                                        <option value="PG">Postgraduate</option>
                                        <option value="UG">Undergraduate</option>
                                        <option value="FND">Foundation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <select
                                        value={filters.country}
                                        onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="">All Countries</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="US">United States</option>
                                        <option value="AU">Australia</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Fee (£)</label>
                                    <input
                                        type="number"
                                        value={filters.minFee}
                                        onChange={(e) => setFilters({ ...filters, minFee: e.target.value })}
                                        placeholder="0"
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Fee (£)</label>
                                    <input
                                        type="number"
                                        value={filters.maxFee}
                                        onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
                                        placeholder="50000"
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Area (Department)</label>
                                    <select
                                        value={filters.department}
                                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="">All Subjects</option>
                                        <option value="Business">Business & Management</option>
                                        <option value="Computer">Computer Science & IT</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Health">Health & Medicine</option>
                                        <option value="Art">Art & Design</option>
                                        <option value="Science">Biological Sciences</option>
                                        <option value="Law">Law</option>
                                        <option value="Education">Education</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific University</label>
                                    <select
                                        value={filters.university}
                                        onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="">All Universities</option>
                                        {universities.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max IELTS</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={filters.maxIelts}
                                        onChange={(e) => setFilters({ ...filters, maxIelts: e.target.value })}
                                        placeholder="7.0"
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Intakes</label>
                                    <div className="flex gap-2">
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={filters.intakeJan}
                                                onChange={(e) => setFilters({ ...filters, intakeJan: e.target.checked })}
                                            />
                                            Jan
                                        </label>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={filters.intakeMay}
                                                onChange={(e) => setFilters({ ...filters, intakeMay: e.target.checked })}
                                            />
                                            May
                                        </label>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={filters.intakeSep}
                                                onChange={(e) => setFilters({ ...filters, intakeSep: e.target.checked })}
                                            />
                                            Sep
                                        </label>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={filters.isPartner}
                                                onChange={(e) => setFilters({ ...filters, isPartner: e.target.checked })}
                                            />
                                            Partners Only
                                        </label>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={filters.verifiedOnly}
                                                onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                                            />
                                            Verified
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Chips & Results Count */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {Object.entries(filters).map(([key, value]) => {
                                if (!value || value === '' || (value as any) === false) return null;
                                let label = '';
                                if (key === 'level') label = `Level: ${value}`;
                                if (key === 'country') label = `Country: ${value}`;
                                if (key === 'minFee') label = `Min: £${value}`;
                                if (key === 'maxFee') label = `Max: £${value}`;
                                if (key === 'department') label = `Subject: ${value}`;
                                if (key === 'university') {
                                    const uni = universities.find(u => u.id.toString() === value.toString());
                                    label = uni ? `Uni: ${uni.name}` : 'University Selected';
                                }
                                if (key.startsWith('intake') && value === true) label = key.replace('intake', '');
                                if (key === 'isPartner' && value === true) label = 'Partner Only';
                                if (key === 'verifiedOnly' && value === true) label = 'Verified';

                                if (!label) return null;

                                return (
                                    <span key={key} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                                        {label}
                                        <button
                                            onClick={() => setFilters({ ...filters, [key]: key.startsWith('intake') || key === 'isPartner' || key === 'verifiedOnly' ? false : '' })}
                                            className="hover:text-blue-800"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                );
                            })}
                            {searchQuery && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                                    "{searchQuery}"
                                    <button onClick={() => setSearchQuery('')} className="hover:text-gray-800">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-slate-900 font-bold">{courses.length}</span> of <span className="text-slate-900 font-bold">{totalResults}</span> courses
                        </p>
                    </div>

                    {/* Search Results */}
                    {courses.length > 0 ? (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {courses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>

                            {hasNextPage && (
                                <div className="flex justify-center pt-8 pb-12">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="px-12 py-4 bg-white border-2 border-slate-200 text-slate-900 font-black uppercase tracking-tighter rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                Load More Courses
                                                <ChevronDown size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border rounded-[2rem] p-20 text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search size={40} className="text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-serif font-black text-slate-900 mb-2 italic">No Courses Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                                We couldn't find any courses matching your specific criteria. Try broadening your search or clearing filters.
                            </p>
                            <button
                                onClick={() => {
                                    setFilters({
                                        minFee: '', maxFee: '', level: '', country: '', maxIelts: '',
                                        university: '', department: '', intakeJan: false, intakeMay: false,
                                        intakeSep: false, isPartner: false, verifiedOnly: false
                                    });
                                    setSearchQuery('');
                                }}
                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Eligibility Match Tab */}
            {activeTab === 'eligibility' && (
                <div className="space-y-4">
                    {/* Student Profile Form */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="text-green-600" size={20} />
                            Your Profile
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select
                                    value={eligibilityProfile.country}
                                    onChange={(e) => setEligibilityProfile({ ...eligibilityProfile, country: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="PK">Pakistan</option>
                                    <option value="BD">Bangladesh</option>
                                    <option value="IN">India</option>
                                    <option value="NG">Nigeria</option>
                                    <option value="GH">Ghana</option>
                                    <option value="KE">Kenya</option>
                                    <option value="NP">Nepal</option>
                                    <option value="LK">Sri Lanka</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IELTS Score</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="9"
                                    value={eligibilityProfile.ielts_score}
                                    onChange={(e) => setEligibilityProfile({ ...eligibilityProfile, ielts_score: parseFloat(e.target.value) })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic %</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={eligibilityProfile.percentage}
                                    onChange={(e) => setEligibilityProfile({ ...eligibilityProfile, percentage: parseInt(e.target.value) })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Study Level</label>
                                <select
                                    value={eligibilityProfile.level}
                                    onChange={(e) => setEligibilityProfile({ ...eligibilityProfile, level: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="PG">Postgraduate (Masters)</option>
                                    <option value="UG">Undergraduate</option>
                                    <option value="FND">Foundation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (£)</label>
                                <input
                                    type="number"
                                    value={eligibilityProfile.max_fee}
                                    onChange={(e) => setEligibilityProfile({ ...eligibilityProfile, max_fee: parseInt(e.target.value) })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Intake</label>
                                <select
                                    value={eligibilityProfile.intake}
                                    onChange={(e) => setEligibilityProfile({ ...eligibilityProfile, intake: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="sep">September</option>
                                    <option value="jan">January</option>
                                    <option value="may">May</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience</label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={eligibilityProfile.has_work_exp}
                                        onChange={(e) => setEligibilityProfile({ ...eligibilityProfile, has_work_exp: e.target.checked })}
                                    />
                                    <span className="text-sm">Has Work Exp</span>
                                </label>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleEligibilityMatch}
                                    disabled={matchLoading}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 w-full justify-center"
                                >
                                    {matchLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                    Find Matches
                                </button>
                                <button
                                    onClick={fetchAiRecommendations}
                                    disabled={aiLoading}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 w-full justify-center"
                                >
                                    {aiLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                    AI Recommendations
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Recommendations Results */}
                    {aiRecommendations.length > 0 && (
                        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-[2rem] border border-indigo-100/50">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="text-[#AD03DE]" />
                                <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight uppercase">AI Recommended For You</h2>
                            </div>
                            <div className="space-y-4">
                                {aiRecommendations.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Eligibility Results */}
                    {eligibilityResults.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">{eligibilityResults.length} matching courses</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 size={12} /> Eligible
                                    </span>
                                    <span className="flex items-center gap-1 text-yellow-600">
                                        <AlertCircle size={12} /> Conditional
                                    </span>
                                    <span className="flex items-center gap-1 text-red-600">
                                        <XCircle size={12} /> Ineligible
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {eligibilityResults.map((result: EligibilityResult) => (
                                    <CourseCard key={result.id} course={result} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
                <div className="space-y-4">
                    {wishlist.size === 0 ? (
                        <div className="bg-white border rounded-lg p-12 text-center">
                            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600">No saved courses yet</h3>
                            <p className="text-gray-500 mt-1">Search for courses and click the heart to save them</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">{wishlist.size} saved courses</p>
                            {courses.filter(c => wishlist.has(c.id)).map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                            {courses.filter(c => wishlist.has(c.id)).length === 0 && (
                                <div className="bg-white border rounded-lg p-8 text-center">
                                    <p className="text-gray-500">Search for courses to see your saved items here</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Compare Modal */}
            {showCompareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <GitCompare className="text-blue-600" />
                                Course Comparison
                            </h2>
                            <button
                                onClick={() => setShowCompareModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
                                {comparisonData.map((course) => (
                                    <div key={course.id} className="border rounded-lg p-4">
                                        <h3 className="font-bold text-gray-900 mb-2">{course.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{course.university_name}</p>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Tuition Fee</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold">{formatCurrency(course.tuition_fee, course.currency)}</span>
                                                    {course.indicators.best_fee && <TrendingDown className="text-green-500" size={14} />}
                                                    {course.indicators.worst_fee && <TrendingUp className="text-red-500" size={14} />}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">IELTS</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold">{course.ielts_overall || 'N/A'}</span>
                                                    {course.indicators.easiest_ielts && <TrendingDown className="text-green-500" size={14} />}
                                                    {course.indicators.hardest_ielts && <TrendingUp className="text-red-500" size={14} />}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Duration</span>
                                                <span className="font-medium">{course.duration || '1 Year'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">City</span>
                                                <span className="font-medium">{course.university_city}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Partner</span>
                                                {course.is_partner ? (
                                                    <CheckCircle2 className="text-green-500" size={16} />
                                                ) : (
                                                    <Minus className="text-gray-400" size={16} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cost Calculator Modal */}
            {showCostModal && selectedCourseForCost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Calculator className="text-green-600" />
                                Cost Calculator
                            </h2>
                            <button
                                onClick={() => setShowCostModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <h3 className="font-bold text-gray-900">{selectedCourseForCost.name}</h3>
                                <p className="text-sm text-gray-600">{selectedCourseForCost.university_name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Years)</label>
                                    <select
                                        value={costDuration}
                                        onChange={(e) => setCostDuration(parseFloat(e.target.value))}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value={1}>1 Year</option>
                                        <option value={1.5}>1.5 Years</option>
                                        <option value={2}>2 Years</option>
                                        <option value={3}>3 Years</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={costCurrency}
                                        onChange={(e) => setCostCurrency(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="GBP">GBP (£)</option>
                                        <option value="PKR">PKR (Rs)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="BDT">BDT (৳)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                            </div>

                            {costLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-green-600" size={32} />
                                </div>
                            ) : costData ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-600">Tuition Fee</span>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(costData.breakdown.tuition.converted, costCurrency)}</p>
                                            <p className="text-xs text-gray-500">£{costData.breakdown.tuition.gbp.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-600">Living Costs</span>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(costData.breakdown.living_costs.converted, costCurrency)}</p>
                                            <p className="text-xs text-gray-500">£{costData.breakdown.living_costs.total_gbp.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-600">Visa Fee</span>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(costData.breakdown.visa_fee.converted, costCurrency)}</p>
                                            <p className="text-xs text-gray-500">£{costData.breakdown.visa_fee.gbp.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-600">Health Surcharge (IHS)</span>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(costData.breakdown.health_surcharge.converted, costCurrency)}</p>
                                            <p className="text-xs text-gray-500">£{costData.breakdown.health_surcharge.gbp.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-3 mt-4">
                                        <span className="font-bold text-green-800">Total Cost</span>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-700">{formatCurrency(costData.grand_total.converted, costCurrency)}</p>
                                            <p className="text-sm text-green-600">£{costData.grand_total.gbp.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Exchange rate: 1 GBP = {costData.exchange_rate} {costCurrency}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Scholarship Detail Modal */}
            {showScholarshipModal && selectedCourseForScholarship && selectedCourseForScholarship.matching_scholarship && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white relative">
                            <button
                                onClick={() => setShowScholarshipModal(false)}
                                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <Gift size={40} className="mb-3 opacity-90" />
                            <h2 className="text-2xl font-bold uppercase tracking-tight">Academic Scholarship</h2>
                            <p className="opacity-90 font-medium">{selectedCourseForScholarship.matching_scholarship.name}</p>
                        </div>

                        <div className="p-6">
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-6">
                                <p className="text-green-700 text-sm font-bold uppercase tracking-wider mb-1">Guaranteed Savings</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-green-600">
                                        {formatCurrency(selectedCourseForScholarship.matching_scholarship.potential_savings, selectedCourseForScholarship.currency)}
                                    </h3>
                                    <span className="text-green-600 font-bold">Reduction</span>
                                </div>
                                <p className="text-green-600/70 text-xs mt-1 font-medium italic">
                                    *Applied automatically to your first year tuition fee
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Award size={18} className="text-amber-500" />
                                    Eligibility Breakdown
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={12} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Academic Score Match</p>
                                            <p className="text-xs text-gray-500">Your profile meets the minimum requirement for this grant.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={12} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">English Proficiency</p>
                                            <p className="text-xs text-gray-500">IELTS overall band score is within the accepted range.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={12} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Partner Exclusive</p>
                                            <p className="text-xs text-gray-500">This scholarship is exclusively available for BWBS prioritized applications.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setShowScholarshipModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => {
                                        setShowScholarshipModal(false);
                                        setQuickApplyCourse(selectedCourseForScholarship);
                                    }}
                                    className="flex-[2] px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    Apply Now
                                    <Gift size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Apply Modal */}

            {quickApplyCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Quick Apply</h2>
                                <p className="text-sm text-gray-600">{quickApplyCourse.name}</p>
                            </div>
                            <button
                                onClick={() => setQuickApplyCourse(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Building2 className="text-purple-600" size={20} />
                                <div>
                                    <p className="font-semibold text-gray-900">{quickApplyCourse.university_name}</p>
                                    <p className="text-sm text-gray-600">{quickApplyCourse.university_city}, {quickApplyCourse.university_country}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                                <span className="px-2 py-0.5 bg-white rounded text-gray-700">
                                    {quickApplyCourse.level_display || quickApplyCourse.level}
                                </span>
                                <span className="text-gray-600">
                                    {formatCurrency(quickApplyCourse.tuition_fee, quickApplyCourse.currency)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Intake
                                </label>
                                <select
                                    value={quickApplyForm.preferred_intake}
                                    onChange={(e) => setQuickApplyForm({ ...quickApplyForm, preferred_intake: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="Jan 2025">January 2025</option>
                                    <option value="May 2025">May 2025</option>
                                    <option value="Sep 2025">September 2025</option>
                                    <option value="Jan 2026">January 2026</option>
                                    <option value="Sep 2026">September 2026</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={quickApplyForm.message}
                                    onChange={(e) => setQuickApplyForm({ ...quickApplyForm, message: e.target.value })}
                                    placeholder="Any specific questions or requirements?"
                                    rows={3}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setQuickApplyCourse(null)}
                                className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setQuickApplyLoading(true);
                                    try {
                                        await api.post('/quick-applies/', {
                                            course: quickApplyCourse.id,
                                            preferred_intake: quickApplyForm.preferred_intake,
                                            message: quickApplyForm.message
                                        });
                                        alert('Application submitted! Our team will contact you shortly.');
                                        setQuickApplyCourse(null);
                                        setQuickApplyForm({ preferred_intake: 'Sep 2025', message: '' });
                                    } catch (error) {
                                        console.error('Quick apply error:', error);
                                        alert('Failed to submit application. Please try again.');
                                    }
                                    setQuickApplyLoading(false);
                                }}
                                disabled={quickApplyLoading}
                                className="flex-1 py-2 px-4 bg-gradient-to-r from-[#AD03DE] to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {quickApplyLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By submitting, you agree to be contacted by our counselors
                        </p>
                    </div>
                </div>
            )}
            {/* Course Review Modal */}
            {showReviewModal && selectedCourseForReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl relative my-8">
                        <div className="p-6 border-b flex justify-between items-center bg-amber-50 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                                    <Star className="text-amber-500 fill-amber-500" size={24} />
                                    Write a Review
                                </h3>
                                <p className="text-amber-700 text-sm">{selectedCourseForReview.name}</p>
                            </div>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="p-2 hover:bg-amber-100 rounded-full text-amber-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
                            {/* Ratings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Overall Experience</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, overall_rating: star })}
                                                className="p-1 transition-transform active:scale-95"
                                            >
                                                <Star
                                                    size={32}
                                                    className={star <= reviewForm.overall_rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Teaching Quality</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={reviewForm.teaching_quality}
                                        onChange={(e) => setReviewForm({ ...reviewForm, teaching_quality: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Career Prospects</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={reviewForm.career_prospects}
                                        onChange={(e) => setReviewForm({ ...reviewForm, career_prospects: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                                        <span>Low</span>
                                        <span>High</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Value for Money</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={reviewForm.value_for_money}
                                        onChange={(e) => setReviewForm({ ...reviewForm, value_for_money: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Review Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Summarize your experience (e.g., Amazing faculty and support)"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    value={reviewForm.title}
                                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Your Experience</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Tell us about the course, campus life, and support..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                                    value={reviewForm.review_text}
                                    onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-green-700 uppercase tracking-wider">Pros</label>
                                    <textarea
                                        rows={2}
                                        placeholder="What did you like most?"
                                        className="w-full px-3 py-2 border border-green-100 bg-green-50/30 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                        value={reviewForm.pros}
                                        onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-red-700 uppercase tracking-wider">Cons</label>
                                    <textarea
                                        rows={2}
                                        placeholder="What could be improved?"
                                        className="w-full px-3 py-2 border border-red-100 bg-red-50/30 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                        value={reviewForm.cons}
                                        onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewLoading}
                                    className="flex-[2] px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {reviewLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            Submit Review
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Career Path Detail Modal */}
            {showCareerModal && selectedCareer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white relative">
                            <button
                                onClick={() => setShowCareerModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <TrendingUp size={40} className="mb-4 opacity-80" />
                            <h3 className="text-2xl font-bold">{selectedCareer.name}</h3>
                            <p className="text-indigo-100 font-medium">{selectedCareer.sector_display || selectedCareer.sector}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {selectedCareer.description || "Comprehensive career pathway offering high growth potential and industry demand within the global market."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Salary Expectation (UK)</h4>
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-xs text-indigo-700 font-bold">Entry Level</span>
                                            <span className="text-xl font-bold text-indigo-900">£{(selectedCareer.salary_min || 25000).toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600" style={{ width: '30%' }} />
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-center">
                                                <p className="text-[10px] text-indigo-500 font-bold uppercase">Average</p>
                                                <p className="text-sm font-bold text-indigo-900">£{(selectedCareer.salary_median || 45000).toLocaleString()}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-indigo-500 font-bold uppercase">Senior</p>
                                                <p className="text-sm font-bold text-indigo-900">£{(selectedCareer.salary_max || 85000).toLocaleString()}+</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Growth Outlook</h4>
                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                                            {selectedCareer.growth_outlook === 'HIGH' ? (
                                                <>
                                                    <TrendingUp size={16} className="text-green-500" />
                                                    High Growth Area
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingUp size={16} className="text-blue-500" />
                                                    Stable Demand
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="w-px h-10 bg-gray-200" />
                                    <div className="flex-1 text-right">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Skills</h4>
                                        <div className="flex flex-wrap justify-end gap-1">
                                            {(selectedCareer.key_skills || "Communication, Analysis, Strategy").split(',').slice(0, 3).map((skill, i) => (
                                                <span key={i} className="text-[9px] font-bold text-indigo-600 bg-indigo-100/50 px-1.5 py-0.5 rounded">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCareerModal(false)}
                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200"
                            >
                                Close Intelligence View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseFinder;
