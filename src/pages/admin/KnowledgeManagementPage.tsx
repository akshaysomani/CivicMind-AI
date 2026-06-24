import React from 'react';
import { BookOpen, FileText, Upload, Settings } from 'lucide-react';

export const KnowledgeManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-indigo-500" />
            Knowledge Management
          </h1>
          <p className="text-slate-400 mt-1">Manage RAG documents, prompt libraries, and AI templates.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Upload className="w-4 h-4" />
          <span>Upload Source</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 col-span-2">
          <h3 className="font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-400" />
            RAG Vector Database Sources
          </h3>
          <div className="space-y-3">
            {[
              { name: 'City_Ordinances_2026.pdf', date: '2026-06-20', size: '2.4 MB', status: 'Indexed' },
              { name: 'Emergency_Protocols_v3.docx', date: '2026-06-18', size: '1.1 MB', status: 'Indexed' },
              { name: 'Public_Works_Guidelines.pdf', date: '2026-06-15', size: '4.8 MB', status: 'Indexed' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.date} • {doc.size}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium border border-emerald-500/20">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-indigo-400" />
            Index Settings
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Documents</p>
              <p className="text-xl font-bold text-white">1,248</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Vector DB Size</p>
              <p className="text-xl font-bold text-white">4.2 GB</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Last Re-indexed</p>
              <p className="text-md font-medium text-white">2 hours ago</p>
            </div>
            <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
              Force Re-index All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeManagementPage;
