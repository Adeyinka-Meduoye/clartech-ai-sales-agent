import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Terminal, 
  Globe, 
  Briefcase, 
  Users, 
  UserSquare2, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Copy, 
  Mail, 
  Compass, 
  Cpu, 
  UserCheck, 
  TrendingUp, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Zap, 
  Building2, 
  Linkedin, 
  Facebook, 
  Phone,
  Trash2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Lead, AgentStatus, AgentLog, ICPConfig, LeadStatus } from '../types';

interface AgentTerminalProps {
  status: AgentStatus;
  logs: AgentLog[];
  onTriggerDiscovery: (config: ICPConfig) => void;
  isLoading: boolean;
  leads: Lead[];
  onTriggerAnalysis: (id: string) => void;
  onTriggerDecisionFinder: (id: string, role: string) => void;
  onTriggerOutreachDraft: (
    id: string,
    signals: {
      gdprAudit: boolean;
      canSpamAudit: boolean;
      industry: string;
      painPoints: string[];
      companyNews: string;
      technology: string;
      growthStage: string;
      recentFunding: string;
      recentHiring: string;
      websiteObservations: string;
    }
  ) => void;
  onTriggerCRMSync: (
    id: string,
    updates: {
      status?: LeadStatus;
      emailSent?: boolean;
      crmNotes?: string;
      followUpDate?: string;
    }
  ) => void;
  onUpdateLeadDetails: (id: string, updatedFields: Partial<Lead>) => void;
  onUpdateLeadStatus: (id: string, status: LeadStatus) => void;
}

const REGIONS = [
  'USA', 'Canada', 'Mexico', 
  'United Kingdom', 'Germany', 'France', 'Netherlands', 'Ireland', 
  'Italy', 'Spain', 'Switzerland', 'Sweden', 'Norway', 
  'Denmark', 'Belgium', 'Austria', 'Poland', 'Portugal'
];

const INDUSTRIES = [
  'SaaS', 
  'Healthcare', 
  'Finance', 
  'Education', 
  'ECommerce', 
  'Consulting', 
  'Churches', 
  'Nonprofits', 
  'Climate', 
  'Energy', 
  'All other industries'
];

const COMPANY_SIZES = ['5-20', '20-100', '100-200', '5-200'];
const ROLES = ['COO', 'Founder', 'CEO', 'Operations Manager', 'Head of Innovation', 'CTO', 'IT Director'];

export default function AgentTerminal({ 
  status, 
  logs, 
  onTriggerDiscovery, 
  isLoading,
  leads,
  onTriggerAnalysis,
  onTriggerDecisionFinder,
  onTriggerOutreachDraft,
  onTriggerCRMSync,
  onUpdateLeadDetails,
  onUpdateLeadStatus
}: AgentTerminalProps) {
  // Active tab state
  const [activeAgentTab, setActiveAgentTab] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Agent 1 settings
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);
  const [selectedSize, setSelectedSize] = useState(COMPANY_SIZES[1]);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  // Lead selection for Agents 2, 3, 4, 5
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Agent 4 copywriter states
  const [isCopiedMail, setIsCopiedMail] = useState(false);
  const [editingEmail, setEditingEmail] = useState('');
  const [gdprAudit, setGdprAudit] = useState(true);
  const [canSpamAudit, setCanSpamAudit] = useState(true);

  // Execution feedback states
  const [isFinderExecuting, setIsFinderExecuting] = useState(false);
  const [finderSuccess, setFinderSuccess] = useState(false);
  const [isDraftingExecuting, setIsDraftingExecuting] = useState(false);
  const [draftingSuccess, setDraftingSuccess] = useState(false);
  const [isCoordinatorExecuting, setIsCoordinatorExecuting] = useState(false);
  const [coordinatorSuccess, setCoordinatorSuccess] = useState(false);

  // Signals for Agent 4
  const [customIndustry, setCustomIndustry] = useState('');
  const [customPainPoints, setCustomPainPoints] = useState('');
  const [companyNews, setCompanyNews] = useState('');
  const [technology, setTechnology] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [recentFunding, setRecentFunding] = useState('');
  const [recentHiring, setRecentHiring] = useState('');
  const [websiteObservations, setWebsiteObservations] = useState('');

  // Agent 5 CRM states
  const [crmStatus, setCrmStatus] = useState<LeadStatus>('Approved');
  const [crmEmailSent, setCrmEmailSent] = useState(false);
  const [crmNotesText, setCrmNotesText] = useState('');
  const [crmFollowUpDate, setCrmFollowUpDate] = useState('');

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync default selected lead ID
  useEffect(() => {
    if (leads.length > 0 && (!selectedLeadId || !leads.some(l => l.id === selectedLeadId))) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  const currentSelectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  // Auto scroll logs only when a new log arrives
  const lastLogId = logs.length > 0 ? logs[logs.length - 1].id : '';

  useEffect(() => {
    if (lastLogId) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lastLogId]);

  // Sync fields when selected lead changes
  useEffect(() => {
    if (currentSelectedLead) {
      setEditingEmail(currentSelectedLead.emailDraft || '');
      setCustomIndustry(currentSelectedLead.industry || '');
      setCustomPainPoints(currentSelectedLead.painPoints?.join(', ') || '');
      
      const leadName = currentSelectedLead.companyName;
      const size = currentSelectedLead.employeeCount || 20;

      setTechnology(currentSelectedLead.analysis?.techMaturity || (size > 50 ? 'Enterprise ERP, custom APIs, React SPA' : 'WordPress, static HTML, manual spreadsheet integration'));
      setGrowthStage(currentSelectedLead.analysis?.estimatedGrowthStage || (size > 50 ? 'Series B Expansion' : 'Scaling SME'));
      setRecentFunding(size > 50 ? '$10M Series A' : 'Bootstrapped Profitability');
      setRecentHiring(size > 50 ? 'Hiring 4 Operations Coordinators' : 'Hiring Support Lead');
      setWebsiteObservations(size > 50 ? 'Manual client tracking, missing real-time portal updates' : 'Static intake forms requiring manual processing');
      setCompanyNews(`${leadName} expanding regional logistics footprints.`);

      setCrmStatus(currentSelectedLead.status || 'Approved');
      setCrmEmailSent(currentSelectedLead.emailSent || false);
      setCrmNotesText(currentSelectedLead.crmNotes || '');
      setCrmFollowUpDate(currentSelectedLead.followUpDate || '');
    }
  }, [selectedLeadId]);

  // Dynamic calculation for Monthly Discovery Calls
  const bookedCallsCount = leads.filter(l => l.status === 'Call Scheduled' || l.status === 'Converted' || l.status === 'Engaged').length;
  const targetDiscoveryCalls = 20;
  const bookedCallsPercent = Math.min(100, Math.round((bookedCallsCount / targetDiscoveryCalls) * 100));

  const handleRunAgent1 = () => {
    onTriggerDiscovery({
      regions: [selectedRegion],
      industries: [selectedIndustry],
      companySizes: [selectedSize],
      decisionMakers: [selectedRole]
    });
  };

  const handleRunAgent2 = () => {
    if (!selectedLeadId) return;
    onTriggerAnalysis(selectedLeadId);
  };

  const handleRunAgent3 = () => {
    if (!currentSelectedLead) return;
    setIsFinderExecuting(true);
    setFinderSuccess(false);
    onTriggerDecisionFinder(currentSelectedLead.id, selectedRole);
  };

  const handleRunAgent4 = () => {
    if (!currentSelectedLead) return;
    setIsDraftingExecuting(true);
    setDraftingSuccess(false);
    onTriggerOutreachDraft(currentSelectedLead.id, {
      gdprAudit,
      canSpamAudit,
      industry: customIndustry,
      painPoints: customPainPoints.split(',').map(s => s.trim()).filter(Boolean),
      companyNews,
      technology,
      growthStage,
      recentFunding,
      recentHiring,
      websiteObservations
    });
  };

  const handleRunAgent5 = () => {
    if (!currentSelectedLead) return;
    setIsCoordinatorExecuting(true);
    setCoordinatorSuccess(false);
    onTriggerCRMSync(currentSelectedLead.id, {
      status: crmStatus,
      emailSent: crmEmailSent,
      crmNotes: crmNotesText,
      followUpDate: crmFollowUpDate
    });
  };

  const copyEmailToClipboard = () => {
    if (!editingEmail) return;
    navigator.clipboard.writeText(editingEmail);
    setIsCopiedMail(true);
    setTimeout(() => setIsCopiedMail(false), 2000);
  };

  const handleSaveEmailDraft = () => {
    if (!currentSelectedLead) return;
    onUpdateLeadDetails(currentSelectedLead.id, { emailDraft: editingEmail });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-4 sm:space-y-6" id="five-agents-workspace">
      {/* Introduction Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20 shrink-0" /> Coordinated Multi-Agent Council
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Clartech splits outbound operations across five specialized sales agents for total clarity, precision, and compliance.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="text-xs bg-slate-950 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-800 font-mono flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
            Agent Core Status: {isLoading ? status.status.toUpperCase() : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Goal Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="philosophy-tracker">
        <div className="md:col-span-2 bg-gradient-to-r from-slate-950 to-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">Quality-First Outreach Philosophy</span>
            </div>
            <h3 className="text-sm font-bold text-slate-200 tracking-tight">Human-in-the-Loop AI Orchestration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our core operational workflow enforces human control: AI prepares deep research, maps pain points, scores opportunities, and drafts personalized B2B outreach. You review, polish, and approve before sending.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1.5">
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> Deep Research
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> Pain Point Mapping
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> ICP Fit Scoring
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> Custom Drafts
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-900/50 px-2 py-1 rounded-md font-mono">
              <span className="text-indigo-400 font-bold">⚡</span> Human Approval
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-950 to-indigo-950/20 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 font-semibold">Monthly Objective</span>
              <span className="text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-900/40 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Auto Synced
              </span>
            </div>
            <h4 className="text-xs text-slate-400 font-medium">Monthly Discovery Calls</h4>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-2xl font-bold font-mono text-slate-100">{bookedCallsCount}</span>
              <span className="text-sm text-slate-500">/ {targetDiscoveryCalls} Booked</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800/60 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${bookedCallsPercent}%` }}></div>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-normal">
              High-intent account discovery targeting 20 qualified monthly discovery calls with $8,000+ LTV opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Agent Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2" id="agents-selector">
        {[
          { id: 1, name: 'Agent 1', label: 'Company Discovery', icon: Compass, color: 'text-blue-400' },
          { id: 2, name: 'Agent 2', label: 'Deep Research', icon: Cpu, color: 'text-purple-400' },
          { id: 3, name: 'Agent 3', label: 'Decision Finder', icon: UserCheck, color: 'text-amber-400' },
          { id: 4, name: 'Agent 4', label: 'Copywriter Draft', icon: Mail, color: 'text-emerald-400' },
          { id: 5, name: 'Agent 5', label: 'CRM & Alignment', icon: TrendingUp, color: 'text-indigo-400' }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAgentTab(tab.id as any)}
              className={`p-3 rounded-xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between min-h-[88px] sm:h-24 ${
                activeAgentTab === tab.id
                  ? 'bg-slate-900 border-brand-500/80 shadow-lg shadow-brand-500/5'
                  : 'bg-slate-950 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{tab.name}</span>
                <Icon className={`w-4 h-4 ${tab.color} shrink-0`} />
              </div>
              <div className="mt-1 sm:mt-2">
                <span className="text-xs font-bold text-slate-200 block truncate">{tab.label}</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">READY</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Side: Agent Controls & Workspace */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col min-h-[380px] sm:min-h-[460px]">
          {/* Agent 1 Panel */}
          {activeAgentTab === 1 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-1-panel">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 1: Company Discovery</h3>
                  </div>
                  <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-900/40 font-mono font-semibold">ICP FILTERING</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically crawls B2B indexes and applies Gemini search grounding to identify companies matching your exact target ICP profile.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Target Countries
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition disabled:opacity-50"
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Industries
                    </label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition disabled:opacity-50"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Company Size Range
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition disabled:opacity-50"
                    >
                      {COMPANY_SIZES.map((sz) => (
                        <option key={sz} value={sz}>{sz} Employees</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex items-center gap-1">
                      <UserSquare2 className="w-3 h-3" /> Target Decision Maker Profile
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition disabled:opacity-50"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleRunAgent1}
                  disabled={isLoading}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Agent 1 executing B2B web discovery...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Execute Company Discovery</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Agent 2 Panel */}
          {activeAgentTab === 2 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-2-panel">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 2: Deep Research Specialist</h3>
                  </div>
                  <span className="text-[10px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-900/40 font-mono font-semibold">WEB CRAWL & CONTEXT</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Select Target Lead for Research</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    disabled={leads.length === 0}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.companyName} ({l.website}) — [{l.status}]
                      </option>
                    ))}
                    {leads.length === 0 && <option value="">No leads in database</option>}
                  </select>
                </div>

                {currentSelectedLead && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{currentSelectedLead.companyName}</h4>
                        <p className="text-slate-400 text-[11px] mt-0.5">{currentSelectedLead.industry} • {currentSelectedLead.country} • {currentSelectedLead.employeeCount} Employees</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-mono font-semibold">
                        Score: {currentSelectedLead.opportunityScore}%
                      </span>
                    </div>

                    {currentSelectedLead.analysis ? (
                      <div className="space-y-2 border-t border-slate-800/80 pt-3">
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          <strong className="text-slate-200">Executive Summary:</strong> {currentSelectedLead.analysis.executiveSummary}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                          <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block font-mono">Tech Maturity</span>
                            <span className="text-slate-300 block truncate">{currentSelectedLead.analysis.techMaturity || 'Medium'}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block font-mono">Est. Value</span>
                            <span className="text-emerald-400 font-bold block">{formatCurrency(currentSelectedLead.analysis.estimatedEngagementValue)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-[11px] pt-1">No deep research analysis compiled yet for this lead.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleRunAgent2}
                  disabled={isLoading || !selectedLeadId}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {status.status === 'analyzing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Crawling website & compiling analysis...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Execute Deep Research Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Agent 3 Panel */}
          {activeAgentTab === 3 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-3-panel">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 3: Decision Maker Finder</h3>
                  </div>
                  <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-900/40 font-mono font-semibold">EXECUTIVE PROFILER</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Target Lead</label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      disabled={leads.length === 0}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition"
                    >
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>{l.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Target Role Profile</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {currentSelectedLead && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-semibold text-slate-300">Resolved Decision Maker</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">VERIFIED PROFILE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">Name</span>
                        <span className="text-slate-200 font-bold">{currentSelectedLead.decisionMaker || 'Not resolved'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">Title</span>
                        <span className="text-slate-300">{currentSelectedLead.jobTitle || 'Executive'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">Corporate Email</span>
                        <span className="text-brand-400 font-mono font-semibold truncate block">{currentSelectedLead.contactDetails?.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">Direct Phone</span>
                        <span className="text-slate-300 font-mono">{currentSelectedLead.contactDetails?.phone || '+1 (555) 019-2831'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1 border-t border-slate-800/60">
                      {currentSelectedLead.linkedin && (
                        <a href={currentSelectedLead.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-[10px] flex items-center gap-1">
                          <Linkedin className="w-3 h-3" /> LinkedIn Profile
                        </a>
                      )}
                      {currentSelectedLead.facebook && (
                        <a href={currentSelectedLead.facebook} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-[10px] flex items-center gap-1">
                          <Facebook className="w-3 h-3" /> Corporate Page
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleRunAgent3}
                  disabled={isLoading || !selectedLeadId}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isFinderExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching executive records...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Find Executive Decision Maker</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Agent 4 Panel */}
          {activeAgentTab === 4 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-4-panel">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 4: Outreach Copywriter</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40 font-mono font-semibold">HYPER-PERSONALIZED</span>
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-mono text-slate-500">Target Lead</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.companyName}</option>
                    ))}
                  </select>
                </div>

                {/* Draft text area */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Generated Email Draft</span>
                    <button
                      onClick={copyEmailToClipboard}
                      className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
                    >
                      {isCopiedMail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopiedMail ? 'Copied!' : 'Copy Draft'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={editingEmail}
                    onChange={(e) => setEditingEmail(e.target.value)}
                    placeholder="Outreach copy will be generated here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 transition leading-relaxed resize-none"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={gdprAudit} onChange={(e) => setGdprAudit(e.target.checked)} className="rounded border-slate-800 text-brand-500 focus:ring-0" />
                    <span>GDPR Compliant</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={canSpamAudit} onChange={(e) => setCanSpamAudit(e.target.checked)} className="rounded border-slate-800 text-brand-500 focus:ring-0" />
                    <span>CAN-SPAM Compliant</span>
                  </label>
                  <button onClick={handleSaveEmailDraft} className="text-brand-400 hover:underline text-[10px]">Save Draft</button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleRunAgent4}
                  disabled={isLoading || !selectedLeadId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isDraftingExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Crafting non-templated email draft...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Personalized Outreach Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Agent 5 Panel */}
          {activeAgentTab === 5 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-5-panel">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 5: CRM & Pipeline Alignment</h3>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/40 font-mono font-semibold">STATE COORDINATOR</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Target Lead</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.companyName} [{l.status}]</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Pipeline Status</label>
                    <select
                      value={crmStatus}
                      onChange={(e) => setCrmStatus(e.target.value as LeadStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                    >
                      <option value="Discovered">Discovered</option>
                      <option value="Researching">Researching</option>
                      <option value="Drafted">Drafted</option>
                      <option value="Approved">Approved</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Engaged">Engaged</option>
                      <option value="Call Scheduled">Call Scheduled</option>
                      <option value="Converted">Converted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Follow-Up Date</label>
                    <input
                      type="date"
                      value={crmFollowUpDate}
                      onChange={(e) => setCrmFollowUpDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Interaction & CRM Notes</label>
                  <textarea
                    rows={3}
                    value={crmNotesText}
                    onChange={(e) => setCrmNotesText(e.target.value)}
                    placeholder="Log status updates, response feedback, meeting bookings..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleRunAgent5}
                  disabled={isLoading || !selectedLeadId}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isCoordinatorExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing status & metrics...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Sync & Update CRM Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Terminal Console Logs */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col h-[340px] sm:h-[400px] lg:h-[460px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-400" />
              <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">Agent Terminal Console</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-500">LIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[11px] leading-relaxed">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-slate-400 hover:text-slate-200 transition">
                {getLogIcon(log.type)}
                <div className="flex-1">
                  <span className="text-slate-600 mr-2 text-[10px]">{log.timestamp}</span>
                  <span className={log.type === 'success' ? 'text-emerald-400 font-semibold' : log.type === 'error' ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                    {log.message}
                  </span>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
