import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReporting } from '../../context/ReportingContext';

import { 
  FileText, Download, Printer, ShieldAlert, 
  MapPin, CheckCircle, ArrowLeft, Activity, Info
} from 'lucide-react';

export const ReportViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedReports, exportReport } = useReporting();

  const report = savedReports.find(r => r.id === Number(id));

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 0.70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  if (!report) {
    return (
      <div className="space-y-4 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
        <Info className="w-12 h-12 text-slate-600" />
        <div>
          <span className="font-extrabold text-sm block">Report document not found.</span>
          <button onClick={() => navigate('/dashboard/citizen/executive-dashboard')} className="text-xs font-bold text-primary hover:underline mt-2">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { content } = report;

  return (
    <div className="space-y-8 pb-10 print:bg-white print:text-black">
      
      {/* Top action row */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {/* Exporter triggers */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/10">
            {['pdf', 'excel', 'csv', 'pptx', 'json'].map(fmt => (
              <button
                key={fmt}
                onClick={() => exportReport(report.id, fmt)}
                className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                {fmt}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="p-2.5 bg-slate-850 hover:bg-slate-750 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-sm space-y-8 print:border-none print:shadow-none print:p-0 print:bg-transparent">
        
        {/* Document Header */}
        <div className="border-b border-white/10 dark:border-white/5 print:border-slate-300 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[9px] font-bold text-primary uppercase tracking-wider">
              AI COMPILED DOCUMENT
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100 print:text-black font-heading mt-1">{report.title}</h1>
            <span className="text-[10px] text-slate-500 print:text-slate-600 block">
              Format type: {report.report_type} | Generated on {new Date(report.created_at).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 print:text-slate-600">Model Confidence</span>
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono ${getScoreColor(content.confidence_score)}`}>
              {Math.round(content.confidence_score * 100)}% Accurate
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-100 print:text-black flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-primary print:hidden" />
            I. Executive Summary
          </h3>
          <p className="text-sm text-slate-300 print:text-slate-800 leading-relaxed pl-1">
            {content.executive_summary}
          </p>
        </div>

        {/* Section 2: Key Metrics Cards */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-100 print:text-black flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-accent print:hidden" />
            II. Operational Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            {Object.entries(content.key_metrics).map(([key, val]) => (
              <div key={key} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl print:border-slate-300">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 print:text-slate-600 block">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-xl font-extrabold text-slate-200 print:text-black block mt-1">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Important Trends */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-100 print:text-black flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-sky-400 print:hidden" />
            III. City Intelligence Trends
          </h3>
          <ul className="list-disc pl-5 text-sm text-slate-300 print:text-slate-850 space-y-2">
            {content.important_trends.map((trend, i) => (
              <li key={i}>{trend}</li>
            ))}
          </ul>
        </div>

        {/* Section 4: Risk Matrix Table */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-100 print:text-black flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500 print:hidden" />
            IV. Strategic Risk Matrix
          </h3>
          
          <div className="overflow-x-auto border border-white/5 print:border-slate-300 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase font-bold border-b border-white/5 print:border-slate-300">
                  <th className="p-3">Domain</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Likelihood</th>
                  <th className="p-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-200 text-slate-300 print:text-slate-800">
                {content.risk_assessment.critical_risks.map((risk, i) => (
                  <tr key={i} className="hover:bg-slate-900/10">
                    <td className="p-3 font-bold text-slate-200 print:text-black">{risk.domain}</td>
                    <td className="p-3 max-w-sm">{risk.description}</td>
                    <td className="p-3">{risk.likelihood}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${
                        risk.severity === 'Critical' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {risk.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Geospatial hotspots list */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-100 print:text-black flex items-center gap-2">
            <MapPin className="w-4.5 h-4.5 text-primary print:hidden" />
            V. Geospatial Focus Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.geospatial_highlights.hotspots.map((h, i) => (
              <div key={i} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="font-extrabold text-xs text-slate-200 print:text-black block">{h.ward}</span>
                  <span className="text-[10px] text-slate-500">{h.type} Hub</span>
                </div>
                <span className="text-base font-black text-primary">{h.count} active reports</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Actionable Recommendations */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-100 print:text-black flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400 print:hidden" />
            VI. Prioritized Action Recommendations
          </h3>

          <div className="space-y-4">
            {content.recommendations.map((rec, i) => (
              <div key={i} className="p-5 bg-slate-950/40 border border-emerald-500/10 rounded-xl space-y-3 print:border-slate-300">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-[8px] font-bold text-emerald-400 uppercase tracking-wider">
                      Priority: {rec.priority}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-200 print:text-black pt-1">{rec.actionable_item}</h4>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-500 block">AI Confidence</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">{Math.round(rec.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] pt-2 border-t border-white/5 print:border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Department</span>
                    <span className="font-bold text-slate-300 print:text-black">{rec.responsible_department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Timeline</span>
                    <span className="font-bold text-slate-300 print:text-black">{rec.suggested_timeline}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Expected Impact</span>
                    <span className="font-bold text-slate-300 print:text-black">{rec.expected_impact}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 print:text-slate-600 italic bg-slate-900/40 p-2.5 rounded border border-white/5">
                  <strong>Evidence:</strong> {rec.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Limitations */}
        <div className="p-4 bg-slate-950/20 border border-white/5 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0" />
          <p className="text-[10px] text-slate-500 leading-normal">
            <strong>Limitations Warning:</strong> {content.limitations}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReportViewerPage;
