import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileBarChart,
  Download,
  Printer,
  Shield,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SeverityBadge } from '../components/ui/Badge';
import { AssessmentReport } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AssessmentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchReports();
        setReports(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-brand-400" />
          Cryptographic Assessment Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Executive security assessments, Crypto-BOM disclosures, and remediation roadmaps.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Report Title</th>
                <th className="pb-3">Report Type</th>
                <th className="pb-3">Auditor / Author</th>
                <th className="pb-3">Date Generated</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    No reports generated yet. Run a scan and click "Generate PDF Report".
                  </td>
                </tr>
              ) : (
                reports.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/reports/${r.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 font-sans font-bold text-white max-w-sm truncate">{r.title}</td>
                    <td className="py-3.5 text-slate-400 capitalize">{r.report_type.replace('_', ' ')}</td>
                    <td className="py-3.5 text-slate-300">{r.generated_by}</td>
                    <td className="py-3.5 text-slate-500 text-[11px]">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-3.5 text-right">
                      <Button variant="cyber" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await api.fetchReportById(id);
        setReport(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !report) {
    return <div className="p-8 text-center text-slate-400">Loading assessment report...</div>;
  }

  const { metadata, scores, executive_summary, remediation_roadmap, crypto_bom, findings } = report.summary_data || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 print:bg-white print:text-black">
      {/* Header action bar (hidden in print) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </button>

        <Button variant="cyber" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
          Print / Save as PDF
        </Button>
      </div>

      {/* Printable Report Document Container */}
      <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-navy-900 shadow-2xl space-y-10 print:border-none print:shadow-none print:p-0 print:bg-transparent">
        {/* Cover / Header */}
        <div className="border-b-2 border-cyan-500/40 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black">
                <Shield className="w-6 h-6 text-navy-950" />
              </div>
              <span className="text-xl font-black font-mono tracking-wider text-white print:text-black">CRYPTOTOOL</span>
            </div>
            <span className="text-xs font-mono uppercase text-slate-400 border border-slate-700 px-3 py-1 rounded-full">
              CONFIDENTIAL • SIH26164
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white print:text-black tracking-tight">{report.title}</h1>
            <p className="text-sm text-slate-400 print:text-slate-600 mt-1 font-mono">
              Organization: {metadata?.organization} • Target: {metadata?.asset_name} ({metadata?.asset_type})
            </p>
          </div>
        </div>

        {/* Executive Score Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-navy-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 font-mono text-center">
          <div>
            <span className="text-xs text-slate-400 print:text-slate-600">Security Score</span>
            <p className="text-3xl font-black text-cyan-400 print:text-blue-700 mt-1">{scores?.overall_security_score}/100</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 print:text-slate-600">PQC Readiness</span>
            <p className="text-3xl font-black text-purple-400 print:text-purple-700 mt-1">{scores?.pqc_readiness_score}/100</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 print:text-slate-600">Critical Issues</span>
            <p className="text-3xl font-black text-rose-400 print:text-red-700 mt-1">{scores?.critical_count}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 print:text-slate-600">Total Primitives</span>
            <p className="text-3xl font-black text-white print:text-black mt-1">{scores?.total_findings}</p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white print:text-black font-mono border-b border-slate-800 pb-2">
            1. Executive Assessment Summary
          </h2>
          <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed font-sans">
            {executive_summary}
          </p>
        </div>

        {/* Section 2: Remediation Roadmap */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black font-mono border-b border-slate-800 pb-2">
            2. Prioritized Cryptographic Remediation Roadmap
          </h2>
          <div className="space-y-2 text-xs font-mono">
            {remediation_roadmap?.map((r: any) => (
              <div key={r.priority} className="p-3.5 rounded-xl border border-slate-800 bg-navy-950/60 print:bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                  P{r.priority}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-white print:text-black font-sans">{r.action}</p>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">Target Timeframe: {r.timeframe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Crypto-BOM Extract */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black font-mono border-b border-slate-800 pb-2">
            3. Cryptographic Bill of Materials (Crypto-BOM)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 print:text-slate-600 uppercase text-[10px]">
                  <th className="pb-2">Algorithm</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">PQC Relevance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-200 print:text-slate-800">
                {crypto_bom?.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-bold text-cyan-300 print:text-blue-700">{c.algorithm}</td>
                    <td className="py-2.5">{c.category}</td>
                    <td className="py-2.5">{c.security_status}</td>
                    <td className="py-2.5">{c.pqc_relevance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Verified Findings Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black font-mono border-b border-slate-800 pb-2">
            4. Discovered Vulnerabilities & Verification Evidence
          </h2>
          <div className="space-y-3 text-xs">
            {findings?.map((f: any) => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-800 bg-navy-950/60 print:bg-slate-50 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white print:text-black">{f.title} ({f.algorithm})</span>
                  <SeverityBadge severity={f.severity} size="sm" />
                </div>
                <p className="text-slate-300 print:text-slate-700 font-sans">{f.description}</p>
                <div className="p-2 rounded bg-navy-950 border border-slate-800 font-mono text-[11px] text-cyan-300 print:text-blue-900">
                  Location: {f.file_path}:{f.line_number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
