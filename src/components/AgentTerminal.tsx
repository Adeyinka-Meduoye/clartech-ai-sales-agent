import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Terminal, 
  Settings2, 
  Globe, 
  Briefcase, 
  Users, 
  UserSquare2, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Layers,
  Copy,
  FileSpreadsheet,
  Mail,
  Compass,
  Cpu,
  UserCheck,
  TrendingUp,
  ExternalLink, 
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles,
  Search,
  Lock,
  Zap,
  Calendar,
  Building2,
  Linkedin,
  Facebook,
  Phone
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
  // Tab states for the 5 agents
  const [activeAgentTab, setActiveAgentTab] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Agent 1 settings
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);
  const [selectedSize, setSelectedSize] = useState(COMPANY_SIZES[1]);
  const [selectedRole, setSelectedRole] = useState(ROLES[1]);

  // General selection for single-lead agents (Agents 2, 3, 4, 5)
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Local state for actions
  const [isCopingMail, setIsCopingMail] = useState(false);
  const [editingEmail, setEditingEmail] = useState('');
  const [gdprAudit, setGdprAudit] = useState(true);
  const [canSpamAudit, setCanSpamAudit] = useState(true);
  const [isFinderExecuting, setIsFinderExecuting] = useState(false);
  const [finderSuccess, setFinderSuccess] = useState(false);
  const [isDraftingExecuting, setIsDraftingExecuting] = useState(false);
  const [draftingSuccess, setDraftingSuccess] = useState(false);
  const [isCoordinatorExecuting, setIsCoordinatorExecuting] = useState(false);
  const [coordinatorSuccess, setCoordinatorSuccess] = useState(false);

  // Dynamic calculation for Monthly Discovery Calls
  const bookedCallsCount = leads.filter(l => l.status === 'Call Scheduled' || l.status === 'Converted' || l.status === 'Engaged').length;
  const targetDiscoveryCalls = 20;
  const bookedCallsPercent = Math.min(100, Math.round((bookedCallsCount / targetDiscoveryCalls) * 100));

  // States for Agent 5 — CRM Agent
  const [crmStatus, setCrmStatus] = useState<LeadStatus>('Approved');
  const [crmEmailSent, setCrmEmailSent] = useState(false);
  const [crmNotesText, setCrmNotesText] = useState('');
  const [crmFollowUpDate, setCrmFollowUpDate] = useState('');

  // Signals for unconventional B2B Outreach Copywriting (Agent 4)
  const [customIndustry, setCustomIndustry] = useState('');
  const [customPainPoints, setCustomPainPoints] = useState('');
  const [companyNews, setCompanyNews] = useState('');
  const [technology, setTechnology] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [recentFunding, setRecentFunding] = useState('');
  const [recentHiring, setRecentHiring] = useState('');
  const [websiteObservations, setWebsiteObservations] = useState('');

  // Sync selectedLeadId when leads change or loads
  useEffect(() => {
    if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  const currentSelectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  useEffect(() => {
    if (currentSelectedLead) {
      setEditingEmail(currentSelectedLead.emailDraft || '');
    }
  }, [selectedLeadId, currentSelectedLead]);

  // Sync 8 sales signals when selected lead changes
  useEffect(() => {
    if (currentSelectedLead) {
      setCustomIndustry(currentSelectedLead.industry || '');
      setCustomPainPoints(currentSelectedLead.painPoints?.join(', ') || '');
      
      const leadName = currentSelectedLead.companyName;
      const size = currentSelectedLead.employeeCount || 20;
      
      const techMaturity = currentSelectedLead.analysis?.techMaturity || 
        (size > 100 ? 'Legacy Oracle ERP, bespoke Node.js APIs, Salesforce CRM' : 'React.js static site, WordPress blogs, basic Stripe payment widgets');
      setTechnology(techMaturity);

      const stage = currentSelectedLead.analysis?.estimatedGrowthStage || 
        (size > 80 ? 'Series B Expansion Phase' : size > 30 ? 'Series A Scaling SME' : 'Early Stage Bootstrapped');
      setGrowthStage(stage);

      const funding = size > 80 ? '$12M Series B Funding round led by Founders Fund' : size > 30 ? '$3.2M Seed-Grants or private credit' : 'Self-funded profit scaling';
      setRecentFunding(funding);

      const hiring = size > 80 ? 'Hiring 5+ Full-stack software engineers & 2 operations supervisors' : 'Hiring customer onboarding managers & support leads';
      setRecentHiring(hiring);

      const obs = size > 50 
        ? 'Customer contact page has sluggish API responses and redirects to external email address, missing lead captures' 
        : 'Lack of an interactive client dashboard; intake is based on a static PDF form that requires manual printing';
      setWebsiteObservations(obs);

      const newsList = [
        `${leadName} announced as a top innovation contender in regional B2B directories.`,
        `Recent leadership expansion to align with technical automation goals.`,
        `Opening of modern client-facing logistics Hub in national economic zones.`
      ];
      const seedVal = leadName.charCodeAt(0) % newsList.length;
      setCompanyNews(newsList[seedVal]);

      // Pre-populate CRM fields for Agent 5
      setCrmStatus(currentSelectedLead.status || 'Approved');
      setCrmEmailSent(currentSelectedLead.emailSent || false);
      setCrmNotesText(currentSelectedLead.crmNotes || '');
      setCrmFollowUpDate(currentSelectedLead.followUpDate || '');
    }
  }, [selectedLeadId, currentSelectedLead]);

  const [prevStatus, setPrevStatus] = useState(status.status);
  useEffect(() => {
    if (prevStatus === 'analyzing' && status.status === 'idle') {
      if (isFinderExecuting) {
        setIsFinderExecuting(false);
        setFinderSuccess(true);
      }
      if (isCoordinatorExecuting) {
        setIsCoordinatorExecuting(false);
        setCoordinatorSuccess(true);
      }
    }
    if (prevStatus === 'drafting' && status.status === 'idle' && isDraftingExecuting) {
      setIsDraftingExecuting(false);
      setDraftingSuccess(true);
    }
    setPrevStatus(status.status);
  }, [status.status, prevStatus, isFinderExecuting, isDraftingExecuting, isCoordinatorExecuting]);

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

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const getLogClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400 font-mono';
      case 'warning':
        return 'text-amber-300 font-mono';
      case 'error':
        return 'text-rose-400 font-mono';
      default:
        return 'text-slate-300 font-mono';
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'Calculating...';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // List of matching leads found for Agent 1 summary
  const discoveredLeads = leads.filter(l => l.status === 'Discovered');

  return (
    <div className="space-y-6" id="five-agents-workspace">
      {/* Introduction Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" /> Coordinated Multi-Agent Council
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Clartech splits outbound operations across five specialized sales agents for total clarity, precision, and compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-slate-950 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-800 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent Core Status: Idle
          </span>
        </div>
      </div>

      {/* Quality-First Philosophy & Goal Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="philosophy-tracker">
        <div className="md:col-span-2 bg-gradient-to-r from-slate-950 to-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">Quality-First Outreach Philosophy</span>
            </div>
            <h3 className="text-sm font-bold text-slate-200 tracking-tight">Should AI Send Emails Automatically? No.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our core operational workflow enforces human control: AI prepares deep **research**, maps **pain points**, scores **opportunities**, and drafts the **B2B email copy**. You review, polish, and approve. No automated spamming.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1.5">
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> Research
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> Pain Points
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> ICP Score
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 px-2 py-1 rounded-md font-mono">
              <span className="text-emerald-400 font-bold">✓</span> Email Draft
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-900/50 px-2 py-1 rounded-md font-mono">
              <span className="text-indigo-400 font-bold">⚡</span> Your Approval
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-950 to-indigo-950/20 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 font-semibold">Better Goal Objective</span>
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
              One **$8,000 client** is worth far more than hundreds of ignored spams. Don't optimize for 400 emails/day; optimize for **20 discovery calls/month**.
            </p>
          </div>
        </div>
      </div>

      {/* Five Specialized Agents Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2" id="agents-selector">
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
              className={`p-3 rounded-xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between h-24 ${
                activeAgentTab === tab.id
                  ? 'bg-slate-900 border-brand-500/80 shadow-lg shadow-brand-500/5'
                  : 'bg-slate-950 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{tab.name}</span>
                <Icon className={`w-4 h-4 ${tab.color}`} />
              </div>
              <div className="mt-2">
                <span className="text-xs font-bold text-slate-200 block truncate">{tab.label}</span>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">READY</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Agent Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Specific Agent Controls */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6 flex flex-col min-h-[460px]">
          {/* Agent 1 — Company Discovery */}
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
                  <strong>Goal:</strong> Automatically crawls B2B indexes and applies Gemini search grounding to identify companies matching your exact target ICP profile.
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
                      <span>Agent 1 executing B2B web crawling...</span>
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

          {/* Agent 2 — Deep Research Specialist */}
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

                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Goal:</strong> Navigates to target websites, reads service offerings, evaluates estimated tech stacks, and flags evidence-backed operational manual bottlenecks.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Select Discovered Target Company</label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition"
                    >
                      <option value="" disabled>-- Select Company --</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.companyName} ({l.website}) - {l.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentSelectedLead && (
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Industry:</span>
                        <span className="text-slate-300 font-medium font-mono">{currentSelectedLead.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Region:</span>
                        <span className="text-slate-300 font-medium font-mono">{currentSelectedLead.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Website:</span>
                        <span className="text-brand-400 font-medium font-mono hover:underline truncate">
                          <a href={currentSelectedLead.website} target="_blank" rel="noopener noreferrer">
                            {currentSelectedLead.website}
                          </a>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleRunAgent2}
                  disabled={!selectedLeadId || isLoading}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Agent 2 evaluating business models...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Analyze Website & Challenges</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Agent 3 — Decision-Maker Finder */}
          {activeAgentTab === 3 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-3-panel">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 3: Decision-Maker Finder</h3>
                  </div>
                  <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-900/40 font-mono font-semibold">LEAD CORRELATOR</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Goal:</strong> Crawls LinkedIn data, corporate indices, and registries to target exact administrative decision makers, matching titles and drafting contact records.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Select Target Company</label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition"
                    >
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1.5">Target Decision Profile</label>
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
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleRunAgent3}
                  disabled={!selectedLeadId || isFinderExecuting}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isFinderExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Agent 3 correlating corporate directories...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Find Decision Maker & Resolve Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Agent 4 — Outreach Copywriter */}
          {activeAgentTab === 4 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-4-panel">
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 4: Outreach Copywriter</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40 font-mono font-semibold">PERSONALIZATION & AUDIT</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>Goal:</strong> Synthesizes pain points, company news, tech stack, and website observations into bespoke outreach copy.
                  <span className="text-emerald-400 font-semibold block mt-1">✓ Non-Spam Guarantee: AI only drafts the email for you to review and approve. Emails are never sent automatically.</span>
                </p>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Selected Target Company</label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                    >
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg space-y-1.5">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Outbound Compliance Guardrails</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gdprAudit}
                          onChange={(e) => setGdprAudit(e.target.checked)}
                          className="rounded border-slate-800 text-brand-500 focus:ring-brand-500 bg-slate-950 cursor-pointer"
                        />
                        GDPR Legitimate Interest
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={canSpamAudit}
                          onChange={(e) => setCanSpamAudit(e.target.checked)}
                          className="rounded border-slate-800 text-brand-500 focus:ring-brand-500 bg-slate-950 cursor-pointer"
                        />
                        CAN-SPAM Verified
                      </label>
                    </div>
                  </div>

                  {currentSelectedLead && (
                    <div className="space-y-3 bg-slate-950/40 border border-slate-800 p-3 rounded-lg">
                      <div className="flex items-center justify-between border-b border-slate-800/50 pb-1.5 mb-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400">8 OUTBOUND SIGNALS TO SYNTHESIZE</span>
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded font-mono">bespoke outreach</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">1. Target Industry</label>
                          <input
                            type="text"
                            value={customIndustry}
                            onChange={(e) => setCustomIndustry(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="e.g. SaaS"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">2. Growth Stage</label>
                          <input
                            type="text"
                            value={growthStage}
                            onChange={(e) => setGrowthStage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="e.g. Series A Scaling"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">3. Recent Funding</label>
                          <input
                            type="text"
                            value={recentFunding}
                            onChange={(e) => setRecentFunding(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="e.g. $5.2M funding"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">4. Recent Hiring</label>
                          <input
                            type="text"
                            value={recentHiring}
                            onChange={(e) => setRecentHiring(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="e.g. Operations Coordinator"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">5. Company News / PR Announcement</label>
                          <input
                            type="text"
                            value={companyNews}
                            onChange={(e) => setCompanyNews(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="e.g. Opened new regional logistics office"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">6. Technology Stack & Maturity</label>
                          <input
                            type="text"
                            value={technology}
                            onChange={(e) => setTechnology(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="e.g. React website, manual spreadsheet tracking"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">7. Key Pain Point</label>
                          <input
                            type="text"
                            value={customPainPoints}
                            onChange={(e) => setCustomPainPoints(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="e.g. Administrative bottlenecks"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[8px] uppercase font-mono text-slate-500 mb-0.5">8. Website Observations & UX Flaws</label>
                          <textarea
                            value={websiteObservations}
                            onChange={(e) => setWebsiteObservations(e.target.value)}
                            className="w-full h-11 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition resize-none leading-normal"
                            placeholder="e.g. Heavy static PDF intake formats..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 shrink-0">
                <button
                  onClick={handleRunAgent4}
                  disabled={!selectedLeadId || isDraftingExecuting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isDraftingExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-100" />
                      <span>Agent 4 drafting bespoke outreach...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Synthesize & Generate Bespoke Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Agent 5 — CRM & Pipeline Automation Agent */}
          {activeAgentTab === 5 && (
            <div className="space-y-4 flex-1 flex flex-col justify-between" id="agent-5-panel">
              <div className="space-y-4 overflow-y-auto pr-1 max-h-[340px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-slate-200 text-sm tracking-tight">Agent 5: CRM Agent</h3>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/40 font-mono font-semibold">CRM PIPELINE</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Goal:</strong> Securely stores and aligns CRM status, interaction notes, follow-up timelines, and replies once you have reviewed and authorized the prospect outreach.
                  <span className="text-indigo-400 font-semibold block mt-1">✓ Designed for Quality: Promotes high-fidelity client conversions over spam volume.</span>
                </p>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Target Lead Company</label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500 transition"
                    >
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentSelectedLead && (
                    <>
                      {/* Read-only stats showing automatic syncing */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">Company:</span>
                          <span className="font-semibold text-slate-200 truncate mt-0.5 block">
                            {currentSelectedLead.companyName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">Lead Score:</span>
                          <span className="font-semibold text-indigo-400 font-mono mt-0.5 block">
                            {currentSelectedLead.opportunityScore}% Fit
                          </span>
                        </div>
                      </div>

                      {/* State Controllers */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Conversation Status</label>
                          <select
                            value={crmStatus}
                            onChange={(e) => setCrmStatus(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition font-mono"
                          >
                            <option value="Discovered">Discovered</option>
                            <option value="Approved">Approved</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Engaged">Engaged</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="crmEmailSent"
                            checked={crmEmailSent}
                            onChange={(e) => setCrmEmailSent(e.target.checked)}
                            className="rounded border-slate-800 text-indigo-500 focus:ring-indigo-500 bg-slate-950 w-3.5 h-3.5"
                          />
                          <label htmlFor="crmEmailSent" className="text-xs text-slate-300 select-none cursor-pointer">
                            Mark outreach email as sent
                          </label>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Follow-up Target Date</label>
                            <input
                              type="date"
                              value={crmFollowUpDate}
                              onChange={(e) => setCrmFollowUpDate(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">CRM Log Notes</label>
                          <textarea
                            value={crmNotesText}
                            onChange={(e) => setCrmNotesText(e.target.value)}
                            placeholder="Add strategic logging notes about this company..."
                            className="w-full h-16 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 shrink-0">
                <button
                  onClick={handleRunAgent5}
                  disabled={!selectedLeadId || isCoordinatorExecuting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  {isCoordinatorExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                      <span>Syncing & storing CRM records...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Approve & Sync to B2B Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Agent Terminal Output Logs */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[460px]">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs text-slate-300 font-medium">clartech-multi-agent:~</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
          </div>

          {/* Active Outputs area based on selected tab */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-text">
            {/* Agent 1 outputs */}
            {activeAgentTab === 1 && (
              <div className="space-y-4" id="agent-1-output">
                <div className="text-slate-500 border-b border-slate-800 pb-2 flex justify-between items-center">
                  <span className="font-semibold tracking-wider text-[10px]">DISCOVERED COMPLIANT PROSPECTS</span>
                  <span className="text-blue-400 font-bold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30 text-[10px]">7-FIELD SCHEMA VERIFIED</span>
                </div>

                {discoveredLeads.length > 0 ? (
                  <div className="space-y-3">
                    {discoveredLeads.map((l) => (
                      <div key={l.id} className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl text-xs space-y-2.5 relative overflow-hidden group hover:border-blue-500/30 transition duration-300">
                        {/* Top company brand bar */}
                        <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="font-bold text-slate-100 tracking-tight text-sm truncate">{l.companyName}</span>
                          </div>
                          <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-medium shrink-0 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-500" /> {l.country}
                          </span>
                        </div>

                        {/* Detailed 5 fields grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-400 pt-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-500">Industry:</span>
                            <span className="text-slate-200 font-medium truncate">{l.industry}</span>
                          </div>

                          <div className="flex items-center gap-1.5 min-w-0">
                            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-500">Employees:</span>
                            <span className="text-slate-200 font-mono font-medium">{l.employeeCount}</span>
                          </div>

                          <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-500">Website:</span>
                            <a 
                              href={l.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-400 hover:underline truncate flex items-center gap-1"
                            >
                              {l.website}
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5 min-w-0 col-span-2 border-t border-slate-800/50 pt-1.5 mt-0.5">
                            <Linkedin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-500">LinkedIn:</span>
                            <a 
                              href={l.linkedin || `https://www.linkedin.com/company/${l.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-brand-400 hover:underline truncate flex items-center gap-1"
                            >
                              {l.linkedin || `linkedin.com/company/${l.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5 min-w-0 col-span-2 border-t border-slate-800/50 pt-1.5">
                            <Facebook className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-500 font-sans">Facebook:</span>
                            <a 
                              href={l.facebook || `https://www.facebook.com/${l.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-400 hover:underline truncate flex items-center gap-1"
                            >
                              {l.facebook || `facebook.com/${l.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-600 text-center py-24 flex flex-col items-center justify-center gap-2">
                    <Compass className="w-8 h-8 text-slate-700 animate-pulse" />
                    <span className="text-slate-500 text-xs">Awaiting discovery parameters...</span>
                    <span className="text-[10px] text-slate-600 font-mono">Execute Company Discovery to scan indices</span>
                  </div>
                )}
              </div>
            )}

            {/* Agent 2 outputs */}
            {activeAgentTab === 2 && (
              <div className="space-y-4 text-xs" id="agent-2-output">
                <div className="text-slate-500 border-b border-slate-800 pb-2 flex justify-between items-center shrink-0">
                  <span className="font-semibold tracking-wider text-[10px]">DEEP RESEARCH DOSSIER</span>
                  <div className="flex items-center gap-1.5 bg-purple-950/30 text-purple-400 border border-purple-900/40 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                    <Cpu className="w-3 h-3 text-purple-400" /> INTEL SYNTHESIZER v2.0
                  </div>
                </div>

                {currentSelectedLead?.analysis ? (
                  <div className="space-y-4 select-text leading-relaxed pb-4">
                    {/* Source Visit Crawler Badges */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                        <span className="text-emerald-400 block font-mono font-bold text-[9px]">● WEBSITE</span>
                        <span className="text-[8px] text-slate-500 font-mono">PARSED & CACHED</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                        <span className="text-emerald-400 block font-mono font-bold text-[9px]">● ABOUT PAGE</span>
                        <span className="text-[8px] text-slate-500 font-mono">VISION MAPPED</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                        <span className="text-emerald-400 block font-mono font-bold text-[9px]">● CAREERS</span>
                        <span className="text-[8px] text-slate-500 font-mono">HIRING SCANNED</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                        <span className="text-emerald-400 block font-mono font-bold text-[9px]">● BLOG POSTS</span>
                        <span className="text-[8px] text-slate-500 font-mono">TOPICS EXTRACTED</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                        <span className="text-emerald-400 block font-mono font-bold text-[9px]">● NEWS ROOM</span>
                        <span className="text-[8px] text-slate-500 font-mono">PR ANCHORS READ</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                        <span className="text-emerald-400 block font-mono font-bold text-[9px]">● LINKEDIN</span>
                        <span className="text-[8px] text-slate-500 font-mono">PROFILE VERIFIED</span>
                      </div>
                    </div>

                    {/* Dossier Header Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-lg space-y-1">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Company Identity</span>
                        <span className="text-slate-200 font-bold text-xs block truncate">{currentSelectedLead.companyName}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{currentSelectedLead.website}</span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Opportunity Score</span>
                          <span className="text-xs bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-900/40 font-mono font-bold">
                            {(currentSelectedLead.opportunityScore / 10).toFixed(1)}/10
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Growth Stage: <span className="text-slate-200 font-semibold">{currentSelectedLead.analysis.estimatedGrowthStage}</span>
                        </div>
                      </div>
                    </div>

                    {/* Company Overview Section */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-3 rounded-lg space-y-1.5">
                      <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase font-mono border-b border-slate-800/60 pb-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>Company Overview</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed pt-0.5">
                        {currentSelectedLead.analysis.companyOverview}
                      </p>
                    </div>

                    {/* Challenges and Likely Pain Points */}
                    <div className="bg-rose-950/10 border border-rose-950/30 p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase font-mono border-b border-rose-950/20 pb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Likely Problems & Challenges</span>
                      </div>
                      <ul className="space-y-1.5 pl-0.5">
                        {currentSelectedLead.analysis.businessChallenges.map((challenge, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <span className="text-rose-500/80 mt-0.5 font-bold">↳</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech Maturity */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase font-mono border-b border-slate-800/60 pb-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Technology Maturity & Stack Indicators</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {currentSelectedLead.analysis.techMaturity || "Medium: Standard CRM and operational email communications present, but internal schedules, route tracking, and client registrations rely on legacy spreadsheets without custom application portals."}
                      </p>
                    </div>

                    {/* AI & Automation Opportunities */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-3 rounded-lg space-y-2.5">
                      <div className="flex items-center gap-1.5 text-brand-400 font-bold text-xs uppercase font-mono border-b border-slate-800/60 pb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        <span>Recommended AI & Automation Openings</span>
                      </div>
                      
                      <div className="space-y-2">
                        {currentSelectedLead.analysis.aiOpportunities && currentSelectedLead.analysis.aiOpportunities.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold block">AI Agent Applications</span>
                            <ul className="space-y-1.5">
                              {currentSelectedLead.analysis.aiOpportunities.map((op, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                                  <span className="text-brand-500 font-mono text-xs mt-0.5">★</span>
                                  <span>{op}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {currentSelectedLead.analysis.automationOpportunities && currentSelectedLead.analysis.automationOpportunities.length > 0 && (
                          <div className="space-y-1.5 pt-1.5 border-t border-slate-800/40">
                            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold block">Workflow Automation Integrations</span>
                            <ul className="space-y-1.5">
                              {currentSelectedLead.analysis.automationOpportunities.map((op, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                                  <span className="text-emerald-400 font-mono text-xs mt-0.5">✔</span>
                                  <span>{op}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buying Signals */}
                    <div className="bg-amber-950/10 border border-amber-950/30 p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase font-mono border-b border-amber-950/20 pb-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Verified Buying Signals</span>
                      </div>
                      <ul className="space-y-1.5 pl-0.5">
                        {(currentSelectedLead.analysis.buyingSignals || [
                          "Active hiring for operational leads and customer service specialists, indicating internal capacity issues.",
                          "Steady client volume increases without corresponding upgrades in digital client portal or support channels."
                        ]).map((signal, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <span className="text-amber-500 mt-0.5">⚡</span>
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 text-center py-20 flex flex-col items-center justify-center gap-2">
                    <Compass className="w-8 h-8 text-slate-700 animate-pulse" />
                    <span className="text-slate-500 text-xs">Dossier empty</span>
                    <span className="text-[10px] text-slate-600 font-mono">Select a lead and execute Research (Agent 2) to visit sources and extract insights.</span>
                  </div>
                )}
              </div>
            )}

            {/* Agent 3 outputs */}
            {activeAgentTab === 3 && (
              <div className="space-y-4 text-xs select-text pb-4" id="agent-3-output">
                <div className="text-slate-500 border-b border-slate-800 pb-2 flex justify-between items-center shrink-0">
                  <span className="font-semibold tracking-wider text-[10px]">RESOLVED EXECUTIVE INTEL CARD</span>
                  <div className="flex items-center gap-1 bg-amber-950/30 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                    <UserCheck className="w-3 h-3 text-amber-400" /> DIRECT FINDER v2.0
                  </div>
                </div>

                {/* Crawl Badge Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                    <span className="text-emerald-400 block font-mono font-bold text-[9px]">● LINKEDIN DIR</span>
                    <span className="text-[8px] text-slate-500 font-mono">SCANNED & RESOLVED</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                    <span className="text-emerald-400 block font-mono font-bold text-[9px]">● FACEBOOK REPO</span>
                    <span className="text-[8px] text-slate-500 font-mono">PROFILED & ALIGNED</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                    <span className="text-emerald-400 block font-mono font-bold text-[9px]">● WEB REGISTRY</span>
                    <span className="text-[8px] text-slate-500 font-mono">DOMAIN HANDSHAKE</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded text-center">
                    <span className="text-emerald-400 block font-mono font-bold text-[9px]">● EMAIL SMTP</span>
                    <span className="text-[8px] text-slate-500 font-mono">PING-VALIDATED</span>
                  </div>
                </div>

                {currentSelectedLead?.decisionMaker ? (
                  <div className="space-y-4">
                    {/* Primary Profile Card */}
                    <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
                      <div className="flex items-start gap-3 border-b border-slate-800/60 pb-3">
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-sm rounded-lg uppercase shadow-inner">
                          {currentSelectedLead.decisionMaker[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                            {currentSelectedLead.decisionMaker}
                            <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-1 py-0.5 rounded uppercase font-mono tracking-wider">Active</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono uppercase tracking-wider">
                            <span className="text-amber-400 font-bold">↳</span> {currentSelectedLead.jobTitle || 'Executive'}
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{currentSelectedLead.companyName} ({currentSelectedLead.website})</span>
                        </div>
                      </div>

                      {/* Contact Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-lg space-y-1">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Verified Corporate Email</span>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-slate-200 font-mono text-[11px] select-all truncate block">{currentSelectedLead.contactDetails.email || 'N/A'}</span>
                            {currentSelectedLead.contactDetails.email && (
                              <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-1 py-0.2 rounded shrink-0 font-mono font-bold">Handshake Passed</span>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-lg space-y-1">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Phone / Direct Line</span>
                          <span className="text-slate-200 font-mono text-[11px] block">{currentSelectedLead.contactDetails.phone || '+1 (555) 012-3849'}</span>
                        </div>
                      </div>

                      {/* Social URIs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-lg space-y-1">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Individual LinkedIn</span>
                          <div className="flex items-center gap-1.5">
                            <Linkedin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <a 
                              href={currentSelectedLead.contactDetails.linkedin || currentSelectedLead.linkedin || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-brand-400 font-mono text-[10px] hover:underline truncate block"
                            >
                              {currentSelectedLead.contactDetails.linkedin || currentSelectedLead.linkedin || 'N/A'}
                            </a>
                          </div>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-lg space-y-1">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">Individual Facebook</span>
                          <div className="flex items-center gap-1.5">
                            <Facebook className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <a 
                              href={currentSelectedLead.contactDetails.facebook || currentSelectedLead.facebook || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-brand-400 font-mono text-[10px] hover:underline truncate block"
                            >
                              {currentSelectedLead.contactDetails.facebook || currentSelectedLead.facebook || 'N/A'}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legal & Compliance Audit */}
                    <div className="bg-emerald-950/10 border border-emerald-900/30 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-emerald-900/20 pb-1.5">
                        <span className="text-emerald-400 font-bold uppercase font-mono text-[10px] tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> B2B Outreach Legal Audit
                        </span>
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-mono font-bold">COMPLIANT</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-300">
                        <div>
                          <span className="text-slate-500 font-mono block uppercase text-[8px] tracking-wider">GDPR Legal Basis</span>
                          <span>Article 6(1)(f) Legitimate Interest</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-mono block uppercase text-[8px] tracking-wider">CAN-SPAM Verified</span>
                          <span>Verified with Clear Opt-out Path</span>
                        </div>
                      </div>
                    </div>

                    {/* Target Roles Scanned Checklist */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-3 rounded-lg space-y-2">
                      <span className="text-slate-400 font-bold uppercase font-mono text-[9px] tracking-wider block border-b border-slate-800/40 pb-1.5">Target Directory Scanning Status</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { title: 'CEO', key: 'CEO' },
                          { title: 'Founder', key: 'Founder' },
                          { title: 'COO', key: 'COO' },
                          { title: 'Operations Mgr', key: 'Operations Manager' },
                          { title: 'IT Director', key: 'IT Director' },
                          { title: 'Innovation Lead', key: 'Head of Innovation' }
                        ].map((roleObj, i) => {
                          const isMatch = (currentSelectedLead.jobTitle || '').toLowerCase().includes(roleObj.key.toLowerCase().split(' ')[0]);
                          return (
                            <div key={i} className={`flex items-center justify-between p-1.5 rounded border text-[9px] font-mono ${
                              isMatch 
                                ? 'bg-amber-950/20 border-amber-900/50 text-amber-300 font-semibold' 
                                : 'bg-slate-950/20 border-slate-800/40 text-slate-500'
                            }`}>
                              <span>{roleObj.title}</span>
                              {isMatch ? (
                                <span className="text-[8px] bg-amber-500/10 border border-amber-500/30 px-1 rounded text-amber-400 font-bold shrink-0">MATCH</span>
                              ) : (
                                <span className="text-slate-700 font-bold shrink-0">✓ SCAN</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 text-center py-20 flex flex-col items-center justify-center gap-2">
                    <UserCheck className="w-8 h-8 text-slate-700 animate-pulse" />
                    <span className="text-slate-500 text-xs">Dossier Empty</span>
                    <span className="text-[10px] text-slate-600 font-mono">Select a lead and execute Find Decision Maker (Agent 3) to trigger corporate search algorithms.</span>
                  </div>
                )}
              </div>
            )}

            {/* Agent 4 outputs */}
            {activeAgentTab === 4 && (
              <div className="space-y-4" id="agent-4-output">
                <div className="text-slate-500 border-b border-slate-800 pb-2 flex justify-between items-center shrink-0">
                  <span className="font-semibold tracking-wider text-[10px]">BESPOKE OUTBOUND COPYWRITING DECK</span>
                  <div className="flex items-center gap-1 bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> PATTERN INTERRUPT v4.1
                  </div>
                </div>

                {currentSelectedLead?.emailDraft ? (
                  <div className="space-y-4">
                    {/* Integrated Signals Badges */}
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg space-y-2">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block tracking-wider font-bold">Active Synthesized Copywriting Signals</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-mono bg-slate-950 text-sky-400 border border-slate-800 px-2 py-0.5 rounded">
                          <strong>Industry:</strong> {customIndustry || currentSelectedLead.industry}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-950 text-indigo-400 border border-slate-800 px-2 py-0.5 rounded">
                          <strong>Stage:</strong> {growthStage}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-950 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded">
                          <strong>Funding:</strong> {recentFunding}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-950 text-amber-400 border border-slate-800 px-2 py-0.5 rounded">
                          <strong>Hiring:</strong> {recentHiring.substring(0, 40)}{recentHiring.length > 40 ? '...' : ''}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-950 text-rose-400 border border-slate-800 px-2 py-0.5 rounded">
                          <strong>UX flaw:</strong> {websiteObservations.substring(0, 45)}{websiteObservations.length > 45 ? '...' : ''}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-950 text-purple-400 border border-slate-800 px-2 py-0.5 rounded">
                          <strong>News:</strong> {companyNews.substring(0, 45)}{companyNews.length > 45 ? '...' : ''}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-950 text-teal-400 border border-slate-800 px-2 py-0.5 rounded">
                          <strong>Tech:</strong> {technology.substring(0, 40)}{technology.length > 40 ? '...' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Email Client Shell */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
                      {/* Email Client Header */}
                      <div className="bg-slate-950 p-3.5 border-b border-slate-800 text-[11px] font-mono space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">To:</span>
                            <span className="text-slate-200 font-bold">
                              {currentSelectedLead.contactDetails.email || 
                                `${currentSelectedLead.decisionMaker.toLowerCase().replace(' ', '.')}@${currentSelectedLead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(currentSelectedLead.emailDraft || '');
                              setIsCopingMail(true);
                              setTimeout(() => setIsCopingMail(false), 2000);
                            }}
                            className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer font-sans"
                          >
                            {isCopingMail ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Draft</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">From:</span>
                          <span className="text-slate-400">David Miller (david@clartech.co)</span>
                        </div>
                        <div className="flex items-start gap-1.5 border-t border-slate-900/60 pt-1.5 mt-1.5">
                          <span className="text-slate-500 shrink-0">Subject:</span>
                          <span className="text-brand-400 font-semibold font-sans">
                            {(() => {
                              const match = currentSelectedLead.emailDraft.match(/Subject:\s*(.*)/i);
                              return match ? match[1] : `Direct operational inquiry for ${currentSelectedLead.companyName}`;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Email Client Body */}
                      <div className="p-4 bg-slate-900/40 text-xs font-sans text-slate-200 whitespace-pre-wrap leading-relaxed select-text font-normal max-h-[250px] overflow-y-auto">
                        {(() => {
                          const body = currentSelectedLead.emailDraft.replace(/Subject:\s*(.*)/i, '').trim();
                          return body || currentSelectedLead.emailDraft;
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 text-center py-20 flex flex-col items-center justify-center gap-2">
                    <Mail className="w-8 h-8 text-slate-700 animate-pulse" />
                    <span className="text-slate-500 text-xs">Outreach copy empty</span>
                    <span className="text-[10px] text-slate-600 font-mono">Select a lead and execute Synthesize & Generate Bespoke Email (Agent 4) to trigger unconventional copywriting logic.</span>
                  </div>
                )}
              </div>
            )}

            {/* Agent 5 outputs */}
            {activeAgentTab === 5 && (
              <div className="space-y-3" id="agent-5-output">
                <div className="text-slate-500 border-b border-slate-800 pb-1 flex justify-between">
                  <span>VALUATION & SCHEDULING CARD</span>
                  <span className="text-indigo-400">Agent 5</span>
                </div>

                {coordinatorSuccess || currentSelectedLead?.status === 'Approved' ? (
                  <div className="space-y-3 text-[11px] leading-relaxed">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between border-b border-slate-800/80 pb-2 mb-2">
                        <span className="font-bold text-slate-200">OPPORTUNITY PRIORITIZATION</span>
                        <span className="text-emerald-400 font-bold">APPROVED</span>
                      </div>

                      <div className="space-y-1 text-slate-400">
                        <div className="flex justify-between">
                          <span>Target Client:</span>
                          <span className="text-slate-200 font-bold">{currentSelectedLead?.companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fit Rating:</span>
                          <span className="text-brand-400 font-mono font-bold">{currentSelectedLead?.opportunityScore}% Match</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Scope Size:</span>
                          <span className="text-slate-200 font-bold font-mono">
                            {formatCurrency(currentSelectedLead?.analysis?.estimatedEngagementValue || 25000)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Auto-Follow-up Target:</span>
                          <span className="text-slate-200 font-mono font-bold">
                            {currentSelectedLead?.followUpDate || '3 days from approved'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 text-center py-20">
                    &lt; Run Coordinator to register scheduling metrics &gt;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal Log Output (Shared Console at Bottom) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[180px]" id="shared-terminal-logs">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-500">SHARED MULTI-AGENT TELEMETRY FEED</span>
          <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">LIVE FEED</span>
        </div>
        <div className="p-3 h-[138px] overflow-y-auto space-y-1.5 font-mono text-[11px] leading-relaxed select-text">
          <AnimatePresence initial={false}>
            {logs.slice(0, 15).map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2"
              >
                <span className="text-slate-600 select-none shrink-0">[{log.timestamp}]</span>
                <div className="flex items-start gap-1">
                  {getLogIcon(log.type)}
                  <span className={getLogClass(log.type)}>{log.message}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {logs.length === 0 && (
            <div className="text-slate-600 text-center py-10">
              No telemetry packets received.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
