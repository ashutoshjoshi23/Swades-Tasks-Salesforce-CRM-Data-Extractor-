import { useState, useEffect } from 'react';
import { getStorage, deleteRecord, clearStorage } from './utils/storage';
import { StorageSchema, ObjectType, SFRecord } from './types';
import { Trash2, RefreshCw, Search, FileJson, FileSpreadsheet, FileBox, Printer, ExternalLink } from 'lucide-react';

const TABS: { id: ObjectType; label: string }[] = [
    { id: 'leads', label: 'Leads' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'tasks', label: 'Tasks' },
];

function App() {
    const [activeTab, setActiveTab] = useState<ObjectType>('leads');
    const [data, setData] = useState<StorageSchema['salesforce_data'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        const storage = await getStorage();
        if (storage && storage.salesforce_data) setData(storage.salesforce_data);
    };

    useEffect(() => {
        loadData();
        chrome.storage.onChanged.addListener(loadData);
        return () => chrome.storage.onChanged.removeListener(loadData);
    }, []);

    const handleExtract = async () => {
        setLoading(true);
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'extract' }, (res) => {
                if (res?.status === 'success') loadData();
                setLoading(false);
            });
        } else setLoading(false);
    };

    const downloadFile = (content: string, fileName: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportData = (format: 'json' | 'csv' | 'word' | 'print') => {
        if (!data) return;
        const allRecords: SFRecord[] = Object.values(data).filter(v => Array.isArray(v)).flat() as SFRecord[];
        if (allRecords.length === 0) return alert('No data to export');

        const timestamp = new Date().getTime();

        if (format === 'json') {
            downloadFile(JSON.stringify(data, null, 2), `sf_data_${timestamp}.json`, 'application/json');
        } else if (format === 'csv') {
            const headers = Array.from(new Set(allRecords.flatMap(r => Object.keys(r))));
            const csv = [headers.join(','), ...allRecords.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
            downloadFile(csv, `sf_data_${timestamp}.csv`, 'text/csv');
        } else if (format === 'word' || format === 'print') {
            let html = `<html><head><style>table{border-collapse:collapse;width:100%;font-family:sans-serif}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}.tag{font-size:10px;background:#eee;padding:2px 4px;border-radius:3px}</style></head><body><h2>Salesforce Extractor Report</h2><table><thead><tr><th>Type</th><th>Name</th><th>Details</th></tr></thead><tbody>`;
            allRecords.forEach(r => {
                const details = Object.entries(r).filter(([k]) => !['id', 'name', 'objectType', 'extractedAt', 'url'].includes(k)).map(([k, v]) => `<b>${k}:</b> ${v}`).join(' | ');
                html += `<tr><td><span class="tag">${r.objectType}</span></td><td>${r.name}</td><td>${details}</td></tr>`;
            });
            html += `</tbody></table></body></html>`;

            if (format === 'word') downloadFile(html, `sf_report_${timestamp}.doc`, 'application/msword');
            else {
                const win = window.open('', '_blank');
                win?.document.write(html);
                win?.document.close();
                win?.print();
            }
        }
    };

    const filteredRecords = data?.[activeTab]?.filter(r => JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase())) || [];

    return (
        <div className="w-[600px] h-[600px] bg-slate-50 flex flex-col font-sans overflow-hidden">
            <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                    <h1 className="text-lg font-bold text-slate-800">SF Extractor</h1>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => exportData('csv')} className="p-2 hover:bg-slate-100 rounded-lg text-emerald-600" title="Export CSV"><FileSpreadsheet size={20} /></button>
                    <button onClick={() => exportData('word')} className="p-2 hover:bg-slate-100 rounded-lg text-blue-600" title="Export Word"><FileBox size={20} /></button>
                    <button onClick={() => exportData('print')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Print View"><Printer size={20} /></button>
                    <button onClick={() => exportData('json')} className="p-2 hover:bg-slate-100 rounded-lg text-amber-600" title="Export JSON"><FileJson size={20} /></button>
                    <button onClick={() => clearStorage().then(loadData)} className="p-2 hover:bg-red-50 rounded-lg text-red-400" title="Clear All"><Trash2 size={20} /></button>
                </div>
            </div>

            <div className="p-4 bg-white border-b space-y-3">
                <button onClick={handleExtract} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-100">
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Extracting...' : 'Extract Current Page'}
                </button>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
            </div>

            <div className="flex bg-white border-b overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
                        {tab.label} ({(data?.[tab.id] || []).length})
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredRecords.length === 0 ? (
                    <div className="text-center py-20 text-slate-300 text-sm">No records found</div>
                ) : (
                    filteredRecords.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-slate-800 truncate">{r.name}</h3>
                                        <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-500"><ExternalLink size={14} /></a>
                                    </div>
                                    <div className="space-y-1">
                                        {Object.entries(r).map(([k, v]) => {
                                            if (['id', 'name', 'objectType', 'extractedAt', 'url'].includes(k)) return null;
                                            return <div key={k} className="text-[11px] flex gap-2"><span className="text-slate-400 w-20 shrink-0 capitalize">{k.replace(/_/g, ' ')}:</span><span className="text-slate-600 font-medium truncate">{v}</span></div>;
                                        })}
                                    </div>
                                </div>
                                <button onClick={() => deleteRecord(activeTab, r.id).then(loadData)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
