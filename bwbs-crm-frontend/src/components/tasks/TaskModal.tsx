import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, updateTask, type Task } from '../../services/tasks';
import { getUsers } from '../../services/users';
import { X, Loader2, Calendar, User, AlertCircle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task;
}

export const TaskModal = ({ isOpen, onClose, task }: ModalProps) => {
    const queryClient = useQueryClient();

    // Fetch users for assignment
    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(),
        enabled: isOpen // Only fetch when modal opens
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        assigned_to_id: '',
        category: 'OTHER',
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
                priority: task.priority,
                status: task.status,
                assigned_to_id: task.assigned_to.id,
                category: task.category || 'OTHER'
            });
        } else {
            setFormData({
                title: '',
                description: '',
                due_date: '',
                priority: 'MEDIUM',
                status: 'PENDING',
                assigned_to_id: '',
                category: 'OTHER'
            });
        }
    }, [task, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            // Transform for API
            const payload = {
                ...data,
                assigned_to: data.assigned_to_id // Backend expects ID
            };

            if (task) {
                return updateTask(task.id, payload);
            }
            return createTask(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-serif font-extrabold text-slate-900 mb-1">
                    {task ? 'Edit Task' : 'New Task'}
                </h2>
                <p className="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-8">
                    {task ? 'Update Activity Details' : 'Schedule New Activity'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                            placeholder="e.g. Call student for visa docs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none resize-none h-24"
                            placeholder="Additional details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">Assign To</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <select
                                    value={formData.assigned_to_id}
                                    onChange={e => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select Staff...</option>
                                    {users?.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">Due Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="datetime-local"
                                    value={formData.due_date}
                                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">Category</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#AD03DE]" />
                                </div>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="DOCUMENTATION">Documentation</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="ADMISSION">Admission</option>
                                    <option value="VISA_PREP">Visa Prep</option>
                                    <option value="POST_ARRIVAL">Post Arrival</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">Priority</label>
                            <div className="relative">
                                <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <select
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {mutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            {task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
