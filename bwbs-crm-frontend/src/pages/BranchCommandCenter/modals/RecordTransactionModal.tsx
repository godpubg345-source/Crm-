import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createTransaction, getFeeTypes } from '../../../services/finance';
import type { TransactionCreateData } from '../../../services/finance';
import { getStudents } from '../../../services/students';
import Modal from '../components/Modal';
import type { ModalProps } from '../types';

const RecordTransactionModal = ({ isOpen, onClose, branchId }: ModalProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm<TransactionCreateData>({
        defaultValues: {
            transaction_type: 'CREDIT',
            status: 'PENDING',
        }
    });

    const [studentSearch, setStudentSearch] = useState('');

    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ['transaction-students', studentSearch],
        queryFn: () => getStudents(1, studentSearch),
        enabled: isOpen,
    });

    const { data: feeTypes = [], isLoading: feeTypesLoading } = useQuery({
        queryKey: ['fee-types'],
        queryFn: getFeeTypes,
        enabled: isOpen,
    });

    const students = studentsData?.results || [];

    const transactionMutation = useMutation({
        mutationFn: (data: TransactionCreateData) => createTransaction({
            ...data,
            fee_type: data.fee_type ? data.fee_type : null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-finance', branchId] });
            reset();
            onClose();
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Financial Event">
            <form onSubmit={handleSubmit((data) => transactionMutation.mutate(data))} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Student</label>
                    <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search student..."
                        className="w-full p-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 outline-none"
                    />
                    <select
                        {...register('student', { required: true })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                        disabled={studentsLoading}
                    >
                        <option value="">{studentsLoading ? 'Loading students...' : 'Select student'}</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {student.first_name} {student.last_name} ({student.student_code})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Fee Type</label>
                    <select
                        {...register('fee_type')}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                        disabled={feeTypesLoading}
                    >
                        <option value="">{feeTypesLoading ? 'Loading fee types...' : 'Select fee type (optional)'}</option>
                        {feeTypes.map((fee) => (
                            <option key={fee.id} value={fee.id}>
                                {fee.name} ({fee.amount})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Amount</label>
                        <input {...register('amount', { required: true, valueAsNumber: true })} type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Type</label>
                        <select {...register('transaction_type')} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                            <option value="CREDIT">Credit</option>
                            <option value="DEBIT">Debit</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
                    <select {...register('status', { required: true })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Description / Notes</label>
                    <textarea {...register('description')} rows={3} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" />
                </div>
                <button
                    type="submit"
                    disabled={transactionMutation.isPending}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                    {transactionMutation.isPending ? 'Recording...' : 'Commit Transaction'}
                </button>
            </form>
        </Modal>
    );
};

export default RecordTransactionModal;
