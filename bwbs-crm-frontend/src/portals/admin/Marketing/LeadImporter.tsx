import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkCreateLeads } from '../../../services/leads';
import { getCounselors } from '../../../services/users';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Users,
    Globe,
    Clock,
    ArrowRight,
    Loader2,
    X
} from 'lucide-react';
import clsx from 'clsx';
import * as XLSX from 'xlsx';

const countries = [
    { code: 'PK', name: 'Pakistan' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
];

const LeadImporter: React.FC = () => {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [assignedCounselor, setAssignedCounselor] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: counselors, isLoading: isLoadingCounselors } = useQuery({
        queryKey: ['counselors'],
        queryFn: getCounselors,
    });

    // Intelligent Auto-Assignment Logic
    React.useEffect(() => {
        if (selectedCountry && counselors) {
            const potentialMatch = (counselors as any[]).find(c =>
                c.dossier?.specialties?.includes(selectedCountry)
            );
            if (potentialMatch) {
                setAssignedCounselor(potentialMatch.id);
            }
        }
    }, [selectedCountry, counselors]);

    const importMutation = useMutation({
        mutationFn: bulkCreateLeads,
        onSuccess: (data: any) => {
            alert(`Succeeded! ${data.count || 'Leads'} deployed to operatives.`);
            setFile(null);
            setPreviewData([]);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
        onError: (error: any) => {
            alert(`Import failed: ${error?.response?.data?.message || 'Check payload'}`);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            setPreviewData(json.slice(0, 5)); // Show first 5 for preview
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (!file || !selectedCountry || !assignedCounselor) {
            alert('Please select file, country, and counselor.');
            return;
        }

        setIsProcessing(true);
        // In a real app, we'd parse the whole file here
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: any[] = XLSX.utils.sheet_to_json(sheet);

            const leadsToUpload: any[] = json.map(item => ({
                first_name: item.FirstName || item.first_name || item.Name?.split(' ')[0] || 'Unknown',
                last_name: item.LastName || item.last_name || item.Name?.split(' ').slice(1).join(' ') || 'Lead',
                email: item.Email || item.email || '',
                phone: item.Phone || item.phone || '',
                source: 'MARKETING_IMPORT',
                target_country: selectedCountry,
                assigned_to: assignedCounselor,
                notes: `Bulk imported for ${selectedCountry} mission.`
            }));

            importMutation.mutate(leadsToUpload);
            setIsProcessing(false);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 p-6">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Import Leads</h1>
                </div>
                <p className="text-slate-500 font-medium ml-6">Upload a spreadsheet of leads and assign them to a counselor.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <aside className="lg:col-span-1 space-y-8">
                    <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-8">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 block mb-4">1. Country</label>
                            <div className="grid grid-cols-2 gap-3">
                                {countries.map(country => (
                                    <button
                                        key={country.code}
                                        onClick={() => setSelectedCountry(country.name)}
                                        className={clsx(
                                            "p-4 rounded-2xl border-2 transition-all text-xs font-semibold flex flex-col items-center gap-2",
                                            selectedCountry === country.name
                                                ? "border-[#7c3aed] bg-purple-50 text-[#7c3aed]"
                                                : "border-slate-50 hover:border-slate-200 text-slate-600"
                                        )}
                                    >
                                        <Globe className="w-5 h-5" />
                                        {country.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-400 block mb-4">2. Assign to counselor</label>
                            <div className="space-y-4">
                                <select
                                    value={assignedCounselor}
                                    onChange={(e) => setAssignedCounselor(e.target.value)}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-semibold focus:ring-2 focus:ring-[#7c3aed] outline-none"
                                >
                                    <option value="">Select Counselor...</option>
                                    {counselors?.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.first_name} {c.last_name} ({c.dossier?.specialties?.join(', ') || 'Generalist'})
                                        </option>
                                    ))}
                                </select>

                                {assignedCounselor && (
                                    <div className="p-4 bg-[#7c3aed]/5 rounded-2xl border border-[#7c3aed]/20 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#7c3aed] font-semibold text-xs">
                                                {counselors?.find((c: any) => c.id === assignedCounselor)?.first_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500">Good match</p>
                                                <p className="text-xs font-bold text-slate-900">
                                                    Operative confirmed for {selectedCountry || 'global'} territory.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-400 block mb-4">3. Data Source (CSV/XLSX)</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="lead-file"
                                />
                                <label
                                    htmlFor="lead-file"
                                    className={clsx(
                                        "w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                                        file ? "border-emerald-200 bg-emerald-50" : "border-slate-200 hover:border-[#7c3aed] hover:bg-purple-50/50"
                                    )}
                                >
                                    {file ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#7c3aed]" />}
                                    <span className="text-xs font-semibold text-slate-500">{file ? file.name : "Select Spreadsheet"}</span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={!file || !selectedCountry || !assignedCounselor || importMutation.isPending}
                            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-[#7c3aed] transition-all disabled:opacity-50 disabled:hover:bg-violet-600"
                        >
                            {importMutation.isPending ? "Executing Import..." : "Execute Bulk Import"}
                        </button>
                    </section>
                </aside>

                {/* Preview Panel */}
                <main className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white min-h-[400px] relative overflow-hidden flex flex-col">

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#7c3aed] border border-white/5">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-semibold tracking-tight">Preview</h2>
                            </div>
                            {file && (
                                <button onClick={() => { setFile(null); setPreviewData([]) }} className="p-3 text-slate-400 hover:text-white transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {previewData.length > 0 ? (
                            <div className="flex-1 overflow-x-auto relative z-10">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider pr-6">Source</th>
                                            <th className="py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider pr-6">Contact</th>
                                            <th className="py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 font-semibold pr-6">{row.FirstName || row.first_name || row.Name || '---'}</td>
                                                <td className="py-4 text-slate-400 pr-6">{row.Email || row.email || '---'}</td>
                                                <td className="py-4 text-slate-400">{row.Phone || row.phone || '---'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                                    <Loader2 className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-300">No file uploaded</h3>
                                    <p className="text-sm text-slate-500 max-w-xs mt-2 font-medium">Upload a CSV or Excel file to preview the leads before importing.</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold text-slate-500">Assigned to</p>
                                <div className="flex items-center gap-3">
                                    {selectedCountry ? (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                    )}
                                    <span className="text-xs font-semibold">{selectedCountry ? `Routed to ${selectedCountry}` : "Country Required"}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold text-slate-500">Counselor</p>
                                <div className="flex items-center gap-3">
                                    {assignedCounselor ? (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    ) : (
                                        <Users className="w-4 h-4 text-amber-500" />
                                    )}
                                    <span className="text-xs font-semibold">
                                        {assignedCounselor ? counselors?.find((c: any) => c.id === assignedCounselor)?.first_name : "Counselor Required"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LeadImporter;
