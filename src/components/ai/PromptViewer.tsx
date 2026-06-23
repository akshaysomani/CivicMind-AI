import React from 'react';
import { FileText } from 'lucide-react';

interface PromptViewerProps {
  prompts: Record<string, { version: string; template: string }>;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({ prompts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(prompts).map(([name, data]) => (
        <div key={name} className="bg-slate-900/30 border border-white/10 dark:border-white/5 rounded-2xl p-5 backdrop-blur-md shadow-sm relative overflow-hidden group hover:border-amber-500/10 transition-colors">
          <div className="absolute right-4 top-4 font-mono text-[10px] text-amber-500 bg-slate-950/40 px-2 py-0.5 border border-white/5 rounded">
            v{data.version}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-center text-slate-400">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {name.replace(/_/g, ' ')}
            </h4>
          </div>

          <div className="bg-slate-950/40 p-3.5 border border-white/5 rounded-xl font-mono text-[10px] text-slate-450 mt-4 leading-relaxed select-all">
            {data.template}
          </div>
        </div>
      ))}
    </div>
  );
};
export default PromptViewer;
