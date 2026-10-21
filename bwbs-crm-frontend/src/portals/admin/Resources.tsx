import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResources, createResource, deleteResource } from '../../services/resources';
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-6">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
            </div>
            <p className="text-xs text-slate-500">Loading resources...</p>
        </div>
    );

    const categories = [
        { id: 'TRAINING', label: 'Training', icon: BookOpen },
        { id: 'MARKETING', label: 'Marketing', icon: Zap },
        { id: 'VISA_GUIDE', label: 'Visa guides', icon: Globe },
        { id: 'UNIVERSITY', label: 'Universities', icon: Briefcase },
        { id: 'POLICY', label: 'Policies', icon: Shield },
        { id: 'OTHER', label: 'Other', icon: FolderOpen },
    ];

    return (
        <div className="p-1 lg:p-4 space-y-6 animate-in fade-in duration-200 ease-out pe-6">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Resources</h1>
                    </div>
                    <p className="text-xs text-slate-500 ml-6 opacity-60">Guides, templates and policies for your team</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-200">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#7c3aed]/10 focus-within:border-[#7c3aed]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 placeholder:text-slate-300 w-56"
                        />
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-2" />
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-3 group"
                    >
                        <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                        Upload
                    </button>
                </div>
            </div>

            {/* Strategic Categorization */}
            <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={clsx(
                        "px-8 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-3",
                        selectedCategory === ''
                            ? 'bg-slate-900 text-white shadow-sm border-slate-900'
                            : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-100'
                    )}
                >
                    <Layers className="w-4 h-4" />
                    All categories
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={clsx(
                            "px-8 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-3",
                            selectedCategory === cat.id
                                ? 'bg-slate-900 text-white shadow-sm border-slate-900'
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
                        className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-[#7c3aed]/20 transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#7c3aed]/5 transition-colors duration-200" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 group-hover:bg-white group-hover:border-[#7c3aed]/10 border border-transparent flex items-center justify-center transition-all duration-200 shadow-sm">
                                    {resource.link ? (
                                        <LinkIcon className="w-7 h-7 text-slate-300 group-hover:text-[#7c3aed] transition-colors" />
                                    ) : (
                                        <FileText className="w-7 h-7 text-slate-300 group-hover:text-[#7c3aed] transition-colors" />
                                    )}
                                </div>
                                <span className="text-[11px] font-bold text-[#7c3aed] bg-[#7c3aed]/5 px-3 py-1 rounded-lg border border-[#7c3aed]/10">
                                    {resource.category}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-[#7c3aed] transition-colors line-clamp-2" title={resource.title}>
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
                                <span className="text-[11px] font-bold text-slate-300">Resource</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {resource.file_url && (
                                    <a
                                        href={resource.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-300 hover:text-[#7c3aed] rounded-xl border border-transparent hover:border-slate-100 transition-all group/btn"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4 transition-transform" />
                                    </a>
                                )}
                                {resource.link && (
                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-300 hover:text-[#7c3aed] rounded-xl border border-transparent hover:border-slate-100 transition-all group/btn"
                                        title="Open link"
                                    >
                                        <ExternalLink className="w-4 h-4 transition-transform" />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleDelete(resource.id)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 text-slate-100 hover:text-rose-500 rounded-xl transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredResources.length === 0 && (
                    <div className="col-span-full h-80 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/20 group">
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-6 transition-transform duration-200">
                            <FolderOpen className="w-10 h-10 text-slate-100 group-hover:text-slate-200 transition-colors" strokeWidth={1} />
                        </div>
                        <h4 className="text-xs text-slate-500">No resources yet</h4>
                        <p className="text-[11px] text-slate-300 font-bold mt-2">Upload guides, templates and policies for your team here.</p>
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
            <div className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-200" onClick={onClose} />

            <div className="bg-white rounded-xl w-full max-w-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-200 p-6 border border-slate-200">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-4 rounded-2xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Upload resource</h2>
                    <p className="text-xs text-slate-500">Share a file or link with your team</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 ml-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all placeholder:text-slate-300"
                            placeholder="e.g. UK visa checklist"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 ml-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:ring-8 focus:ring-[#7c3aed]/5 outline-none resize-none transition-all placeholder:text-slate-300"
                            placeholder="What is this for?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 ml-1">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all appearance-none cursor-pointer"
                            >
                                <option value="TRAINING">Training</option>
                                <option value="MARKETING">Marketing</option>
                                <option value="VISA_GUIDE">Visa guides</option>
                                <option value="UNIVERSITY">University info</option>
                                <option value="POLICY">Policy</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 ml-1">Link (URL)</label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                                <input
                                    type="url"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-mono font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all placeholder:text-slate-200"
                                    placeholder="https://institutional-link.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs text-slate-500 ml-1">File</label>
                        <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center group/upload hover:border-[#7c3aed]/30 transition-all cursor-pointer relative overflow-hidden">
                            <Plus className="w-8 h-8 text-slate-200 group-hover/upload:text-[#7c3aed] transition-colors mb-4 duration-200" strokeWidth={1.5} />
                            <p className="text-xs text-slate-500">
                                {file ? file.name : 'Choose a file'}
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
                            className="px-6 py-4 rounded-2xl text-xs text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-3 disabled:opacity-50"
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
