import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '../services/auth';
import { getBranches } from '../services/branches';

export const useBranch = () => {
    const queryClient = useQueryClient();
    const user = getCurrentUser();

    // Logic from permissions
    const canSwitchBranch =
        user?.role === 'SUPER_ADMIN' ||
        user?.role === 'AUDITOR' ||
        user?.role === 'COUNTRY_MANAGER' ||
        user?.role === 'BRANCH_MANAGER'; // expanded roles slightly to be safe, or stick to strict list

    const [selectedBranch, setBranch] = useState(() => localStorage.getItem('branch_id') || '');

    // Reset if user loses permission
    useEffect(() => {
        if (!canSwitchBranch && selectedBranch) {
            localStorage.removeItem('branch_id');
            // Defer update to avoid synchronous cascading renders
            window.setTimeout(() => setBranch(''), 0);
        }
    }, [canSwitchBranch, selectedBranch]);

    const { data: branches = [], refetch } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches,
        enabled: Boolean(canSwitchBranch), // Ensure boolean
    });

    const setSelectedBranch = (branchId: string) => {
        setBranch(branchId);
        if (branchId) {
            localStorage.setItem('branch_id', branchId);
        } else {
            localStorage.removeItem('branch_id');
        }
        // Big Hammer: Refetch everything when branch changes
        queryClient.invalidateQueries();
    };

    return {
        selectedBranch,
        setSelectedBranch,
        branches,
        canSwitchBranch,
        fetchBranches: refetch
    };
};
