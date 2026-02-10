import type {
    Branch,
    BranchAnalytics,
    FixedAsset,
    BranchComplaint,
    BranchFinanceSummary,
    BranchTarget,
    PredictiveStaffing
} from '../../../services/branches';
import type { UserListItem } from '../../../services/users';
import type { CommunicationLog } from '../../../services/communications';

export type TabType = 'overview' | 'team' | 'finance' | 'assets' | 'intelligence' | 'reports' | 'targets' | 'comms';

export interface TabProps {
    branchId: string;
}

export interface OverviewTabProps {
    branch: Branch;
    analytics?: BranchAnalytics;
    staff?: UserListItem[];
}

export interface TeamTabProps extends TabProps {
    staff?: UserListItem[];
    onOnboard: () => void;
}

export interface FinanceTabProps extends TabProps {
    staff?: UserListItem[];
    onRecordTransaction: () => void;
}

export interface OperationsTabProps extends TabProps {
    onAddAsset: () => void;
    onAddComplaint: () => void;
}

export interface ReportsTabProps extends TabProps {
    analytics?: BranchAnalytics;
}

export interface TargetsTabProps extends TabProps {
    analytics?: BranchAnalytics;
    onSetQuota: () => void;
}

export interface CommsTabProps extends TabProps {
    onBroadcast: () => void;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchId: string;
}
