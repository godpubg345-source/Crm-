import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResources, createResource, deleteResource } from '../services/resources';
import {
    FolderOpen,
    FileText,
    Link as LinkIcon,
    Search,
    Trash2,
    Download,
    ExternalLink,
    X,
    Loader2,
    Layers,
    Globe,
    Zap,
    Plus,
    FileUp,
    BookOpen,
    Shield,
    Briefcase
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// RESOURCE LIBRARY - INSTITUTIONAL KNOWLEDGE REPOSITORY
// ============================================================================

const ResourceLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const { data: resources = [], isLoading } = useQuery({
        queryKey: ['resources', selectedCategory],
        queryFn: () => getResources(selectedCategory)
    });

    const filteredResources = resources.filter(res =>
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const deleteMutation = useMutation({
        mutationFn: deleteResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Confirm deletion of institutional asset from the repository?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-12">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Archiving Institutional Intelligence</p>
        </div>
    );

    const categories = [
        { id: 'TRAINING', label: 'Curriculum & Training', icon: BookOpen },
        { id: 'MARKETING', label: 'Marketing Visuals', icon: Zap },
        { id: 'VISA_GUIDE', label: 'Diplomatic Protocols', icon: Globe },
        { id: 'UNIVERSITY', label: 'Scholarly Partners', icon: Briefcase },
        { id: 'POLICY', label: 'Governance & Policy', icon: Shield },
        { id: 'OTHER', label: 'Auxiliary Data', icon: FolderOpen },
    ];

    return (
        <div className="p-1 lg:p-4 space-y-12 animate-in fade-in duration-1000 ease-out pe-6">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-10 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                        <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight leading-none">Resource Hub</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] ml-6 opacity-60">Institutional assets • Tactical intelligence • Knowledge repository</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#AD03DE]/10 focus-within:border-[#AD03DE]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Intelligence Base..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-800 placeholder:text-slate-300 w-56 uppercase tracking-widest"
                        />
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-2" />
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                        Deposit Intelligence
                    </button>
                </div>
            </div>

            {/* Strategic Categorization */}
            <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={clsx(
                        "px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-3",
                        selectedCategory === ''
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 border-slate-900'
                            : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-100'
                    )}
                >
                    <Layers className="w-4 h-4" />
                    All Domains
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={clsx(
                            "px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-3",
                            selectedCategory === cat.id
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 border-slate-900'
                                : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-100'
                        )}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredResources.map((resource) => (
                    <div
                        key={resource.id}
                        className="group bg-white p-8 rounded-[2.5rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col justify-between h-full relative overflow-hidden"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#AD03DE]/5 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:shadow-lg group-hover:border-[#AD03DE]/10 group-hover:rotate-6 border border-transparent flex items-center justify-center transition-all duration-500 shadow-sm">
                                    {resource.link ? (
                                        <LinkIcon className="w-7 h-7 text-slate-300 group-hover:text-[#AD03DE] transition-colors" />
                                    ) : (
                                        <FileText className="w-7 h-7 text-slate-300 group-hover:text-[#AD03DE] transition-colors" />
                                    )}
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#AD03DE] bg-[#AD03DE]/5 px-3 py-1 rounded-lg border border-[#AD03DE]/10">
                                    {resource.category}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight group-hover:text-[#AD03DE] transition-colors line-clamp-2" title={resource.title}>
                                    {resource.title}
                                </h3>
                                <p className="text-[11px] font-medium text-slate-400 line-clamp-3 leading-relaxed">
                                    {resource.description || 'Institutional resource component with strategic intelligence significance.'}
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 mt-auto flex items-center justify-between border-t border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Global Asset</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {resource.file_url && (
                                    <a
                                        href={resource.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-300 hover:text-[#AD03DE] rounded-xl border border-transparent hover:border-slate-100 transition-all group/btn"
                                        title="Download Asset"
                                    >
                                        <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                )}
                                {resource.link && (
                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-300 hover:text-[#AD03DE] rounded-xl border border-transparent hover:border-slate-100 transition-all group/btn"
                                        title="Access Eternal Link"
                                    >
                                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleDelete(resource.id)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 text-slate-100 hover:text-rose-500 rounded-xl transition-all"
                                    title="Decommission Asset"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredResources.length === 0 && (
                    <div className="col-span-full h-80 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/20 group">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-700">
                            <FolderOpen className="w-10 h-10 text-slate-100 group-hover:text-slate-200 transition-colors" strokeWidth={1} />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Intelligence Repository Vacant</h4>
                        <p className="text-[9px] text-slate-300 font-serif font-bold mt-2">No scholarly assets detected in this domain.</p>
                    </div>
                )}
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
};

const UploadModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('OTHER');
    const [link, setLink] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            onClose();
            setTitle('');
            setDescription('');
            setCategory('OTHER');
            setLink('');
            setFile(null);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        if (link) formData.append('link', link);
        if (file) formData.append('file', file);
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 p-12 border border-white">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-4 rounded-2xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all active:scale-90"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-10">
                    <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight mb-2">Deposit Asset</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Institutional intelligence contribution</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-serif font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all placeholder:text-slate-300"
                            placeholder="Resource Identity..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-serif font-bold text-slate-600 focus:ring-8 focus:ring-[#AD03DE]/5 outline-none resize-none transition-all placeholder:text-slate-300"
                            placeholder="Strategic observations and context..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Domain Domain</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all appearance-none cursor-pointer"
                            >
                                <option value="TRAINING">Curriculum Material</option>
                                <option value="MARKETING">Marketing Assets</option>
                                <option value="VISA_GUIDE">Visa Guidelines</option>
                                <option value="UNIVERSITY">University Data</option>
                                <option value="POLICY">Institutional Policy</option>
                                <option value="OTHER">Other Auxiliary</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">External Protocol (URL)</label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                                <input
                                    type="url"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all placeholder:text-slate-200"
                                    placeholder="https://institutional-link.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Binary File Deposit</label>
                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 flex flex-col items-center justify-center group/upload hover:border-[#AD03DE]/30 transition-all cursor-pointer relative overflow-hidden">
                            <Plus className="w-8 h-8 text-slate-200 group-hover/upload:text-[#AD03DE] transition-colors mb-4 group-hover/upload:scale-110 duration-500" strokeWidth={1.5} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {file ? file.name : 'Select Deployment Package'}
                            </p>
                            <input
                                type="file"
                                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-4 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Abstain
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-12 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {mutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            ) : (
                                <Zap className="w-4 h-4 text-emerald-400" />
                            )}
                            Sync Repository
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceLibrary;
