import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  CheckSquare, 
  FileText, 
  ThumbsUp, 
  Send, 
  Calendar, 
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';

interface CRMPipelineProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLeadStatus: (id: string, status: LeadStatus) => void;
  onDeleteLead: (id: string) => void;
  onTriggerAnalysis: (id: string) => void;
  onOpenCreateModal: () => void;
  isAnalysingId?: string;
}

const COUNTRIES = ['All Regions', 'United States', 'Canada', 'United Kingdom', 'Germany', 'Netherlands', 'Ireland', 'France', 'Sweden'];
const INDUSTRIES = ['All Industries', 'SaaS', 'Professional Services', 'Healthcare', 'Financial Services', 'Manufacturing', 'Logistics', 'Education', 'Churches', 'Nonprofits'];

export default function CRMPipeline({
  leads,
  onSelectLead,
  onUpdateLeadStatus,
  onDeleteLead,
  onTriggerAnalysis,
  onOpenCreateModal,
  isAnalysingId
}: CRMPipelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Regions');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [minScore, setMinScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<LeadStatus | 'All'>('All');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lead.decisionMaker && lead.decisionMaker.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCountry = selectedCountry === 'All Regions' || lead.country === selectedCountry;
    const matchesIndustry = selectedIndustry === 'All Industries' || lead.industry === selectedIndustry;
    const matchesScore = lead.opportunityScore >= minScore;
    const matchesStatus = activeTab === 'All' || lead.status === activeTab;

    return matchesSearch && matchesCountry && matchesIndustry && matchesScore && matchesStatus;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'Discovered':
        return 'bg-blue-900/40 text-blue-300 border border-blue-800/60';
      case 'Researching':
        return 'bg-purple-900/40 text-purple-300 border border-purple-800/60 animate-pulse';
      case 'Drafted':
        return 'bg-amber-900/40 text-amber-300 border border-amber-800/60';
      case 'Approved':
        return 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/60';
      case 'Contacted':
        return 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/60';
      case 'Engaged':
        return 'bg-rose-900/40 text-rose-300 border border-rose-800/60';
      case 'Call Scheduled':
        return 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/80 font-bold';
      case 'Converted':
        return 'bg-teal-950/60 text-teal-300 border border-teal-700/80 font-bold';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50';
    if (score >= 75) return 'text-amber-400 bg-amber-950/40 border-amber-900/50';
    return 'text-rose-400 bg-rose-950/40 border-rose-900/50';
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-4 sm:p-6" id="crm-pipeline-root">
      {/* CRM Actions & Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">Sales Pipeline & CRM</h2>
          <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">Review opportunities, customize personalized emails, and advance outreach statuses.</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 transition self-stretch sm:self-start cursor-pointer text-xs sm:text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Custom Prospect
        </button>
      </div>

      {/* Advanced Filters panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search company, URL, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <TrendingUp className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-slate-400 text-[10px] uppercase font-mono mb-0.5">
              <span>ICP Match Min</span>
              <span className="font-bold text-slate-300">{minScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Status Pipeline Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 mb-6 gap-2 pb-px" id="crm-tabs">
        {(['All', 'Discovered', 'Researching', 'Drafted', 'Approved', 'Contacted', 'Engaged', 'Call Scheduled', 'Converted', 'Rejected'] as const).map((tab) => {
          const count = tab === 'All' ? leads.length : leads.filter((l) => l.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-medium tracking-wide border-b-2 font-mono whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <span>{tab}</span>
              <span className="bg-slate-950 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-800">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* CRM Leads Table/List View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              <th className="py-3 px-4">Company Name</th>
              <th className="py-3 px-4">ICP Score</th>
              <th className="py-3 px-4">Contact Profile</th>
              <th className="py-3 px-4">Pipeline Status</th>
              <th className="py-3 px-4">Proj. Value</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredLeads.map((lead) => {
              const isAnalysing = isAnalysingId === lead.id;
              return (
                <tr 
                  key={lead.id} 
                  className="hover:bg-slate-950/40 transition cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  {/* Company Column */}
                  <td className="py-4 px-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-brand-500 uppercase select-none shrink-0">
                        {lead.companyName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-100 truncate">{lead.companyName}</div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" /> {lead.industry}
                          </span>
                          <span className="text-slate-700 font-mono text-[10px]">•</span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" /> {lead.country}
                          </span>
                          {lead.assignedTo && (
                            <>
                              <span className="text-slate-700 font-mono text-[10px]">•</span>
                              <span className="inline-flex items-center gap-1 text-[9px] bg-brand-500/10 text-brand-300 px-1.5 py-px rounded border border-brand-500/20 font-mono">
                                👤 {lead.assignedTo}
                              </span>
                            </>
                          )}
                        </div>
                        {/* Agent 5 Outreach & Reply indicators */}
                        {(lead.emailSent || (lead.repliesReceived && lead.repliesReceived.length > 0)) && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {lead.emailSent && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-950/60 text-indigo-300 px-1.5 py-px rounded border border-indigo-900/40 font-mono font-medium" title="Outreach Email Sent">
                                <Send className="w-2.5 h-2.5" /> Sent
                              </span>
                            )}
                            {lead.repliesReceived && lead.repliesReceived.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-950/60 text-emerald-300 px-1.5 py-px rounded border border-emerald-900/40 font-mono font-medium animate-pulse" title="Prospect Reply Received">
                                <HelpCircle className="w-2.5 h-2.5 text-emerald-400" /> Replied
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ICP Score Column */}
                  <td className="py-4 px-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${getScoreColor(lead.opportunityScore)}`}>
                      <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>{lead.opportunityScore}%</span>
                    </div>
                  </td>

                  {/* Contact Profile Column */}
                  <td className="py-4 px-4">
                    {lead.decisionMaker ? (
                      <div>
                        <div className="text-xs font-medium text-slate-200">{lead.decisionMaker}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{lead.jobTitle}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Unidentified</span>
                    )}
                  </td>

                  {/* Pipeline Status Column */}
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Projected Value Column */}
                  <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-300">
                    {lead.analysis?.estimatedEngagementValue 
                      ? formatCurrency(lead.analysis.estimatedEngagementValue)
                      : 'Not Analyzed'}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {/* Trigger Research button if Discovered */}
                      {lead.status === 'Discovered' && (
                        <button
                          onClick={() => onTriggerAnalysis(lead.id)}
                          disabled={isAnalysing}
                          title="Deep analyze company & draft outreach"
                          className="bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 p-1.5 rounded-lg border border-brand-500/20 transition cursor-pointer disabled:opacity-50"
                        >
                          {isAnalysing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onSelectLead(lead)}
                        className="bg-slate-950 hover:bg-slate-800 text-slate-300 p-1.5 rounded-lg border border-slate-800 transition cursor-pointer"
                        title="Open lead details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-lg border border-rose-500/20 transition cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="max-w-md mx-auto space-y-4 px-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-950/40 text-indigo-400 border border-indigo-900/40">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-200">Your Sales Pipeline is Empty</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        To get started, configure and run **Agent 1: Company Discovery** in the Council above to scan for potential targets, or click **Add Custom Prospect** to insert a lead manually.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={onOpenCreateModal}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-900/50 px-3.5 py-2 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Your First Lead
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                  No prospects match current filters or search query.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
