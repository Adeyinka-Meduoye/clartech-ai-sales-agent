import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clartechLogo from './assets/images/clartech_company_logo_1785172701052.jpg';
import { 
  Terminal, 
  Layers, 
  Sparkles, 
  Briefcase, 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  Users, 
  Building2, 
  CheckCircle, 
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Lead, AgentStatus, AgentLog, LeadStatus, ICPConfig } from './types';
import AgentTerminal from './components/AgentTerminal';
import CRMPipeline from './components/CRMPipeline';
import LeadDetailsDrawer from './components/LeadDetailsDrawer';
import CreateLeadModal from './components/CreateLeadModal';

export default function App() {
  const [activeView, setActiveView] = useState<'pipeline' | 'agent' | 'insights'>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    status: 'idle',
    currentTask: undefined,
    leadsDiscoveredCount: 0,
    leadsAnalyzedCount: 0,
    emailsDraftedCount: 0
  });
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAnalysingId, setIsAnalysingId] = useState<string | undefined>(undefined);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Fetch leads and agent data from Express API
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) return;
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchAgentStatus = async () => {
    try {
      const res = await fetch('/api/agent/status');
      if (!res.ok) return;
      const data = await res.json();
      setAgentStatus(data);
    } catch (err) {
      console.error('Failed to fetch agent status:', err);
    }
  };

  const fetchAgentLogs = async () => {
    try {
      const res = await fetch('/api/agent/logs');
      if (!res.ok) return;
      const data = await res.json();
      setAgentLogs(data);
    } catch (err) {
      console.error('Failed to fetch agent logs:', err);
    }
  };

  // Poll for data updates
  useEffect(() => {
    fetchLeads();
    fetchAgentStatus();
    fetchAgentLogs();

    const interval = setInterval(() => {
      fetchLeads();
      fetchAgentStatus();
      fetchAgentLogs();
    }, 2500); // Poll every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  // Sync selectedLead when the leads list changes
  useEffect(() => {
    if (selectedLead) {
      const currentSelected = leads.find((l) => l.id === selectedLead.id);
      if (currentSelected) {
        setSelectedLead(currentSelected);
      }
    }
  }, [leads, selectedLead]);

  // Operations
  const handleTriggerDiscovery = async (config: ICPConfig) => {
    try {
      await fetch('/api/agent/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: config.industries[0],
          region: config.regions[0],
          minSize: config.companySizes[0].split('-')[0],
          maxSize: config.companySizes[0].split('-')[1],
          role: config.decisionMakers[0]
        })
      });
      fetchAgentStatus();
      fetchAgentLogs();
    } catch (err) {
      console.error('Failed to trigger discovery agent:', err);
    }
  };

  const handleTriggerAnalysis = async (id: string) => {
    setIsAnalysingId(id);
    try {
      await fetch(`/api/agent/analyze/${id}`, { method: 'POST' });
      fetchLeads();
      fetchAgentStatus();
      fetchAgentLogs();
    } catch (err) {
      console.error('Failed to analyze lead:', err);
    } finally {
      setIsAnalysingId(undefined);
    }
  };

  const handleTriggerDecisionFinder = async (id: string, role: string) => {
    try {
      await fetch(`/api/agent/find-decision-maker/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      fetchLeads();
      fetchAgentStatus();
      fetchAgentLogs();
    } catch (err) {
      console.error('Failed to run Decision Maker finder:', err);
    }
  };

  const handleTriggerOutreachDraft = async (
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
  ) => {
    try {
      await fetch(`/api/agent/generate-outreach/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signals)
      });
      fetchLeads();
      fetchAgentStatus();
      fetchAgentLogs();
    } catch (err) {
      console.error('Failed to trigger outreach copywriting agent:', err);
    }
  };

  const handleTriggerCRMSync = async (
    id: string,
    updates: {
      status?: LeadStatus;
      emailSent?: boolean;
      crmNotes?: string;
      followUpDate?: string;
    }
  ) => {
    try {
      await fetch(`/api/agent/crm-sync/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchLeads();
      fetchAgentStatus();
      fetchAgentLogs();
    } catch (err) {
      console.error('Failed to trigger CRM sync agent:', err);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleUpdateLeadDetails = async (id: string, updatedFields: Partial<Lead>) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to update lead details:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this lead?')) {
      try {
        const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        if (res.ok) {
          if (selectedLead?.id === id) {
            setSelectedLead(null);
          }
          fetchLeads();
        }
      } catch (err) {
        console.error('Failed to delete lead:', err);
      }
    }
  };

  const handleCreateManualLead = async (leadDetails: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadDetails)
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to save manual lead:', err);
    }
  };

  // Analytics Helpers for ICP Insights Tab
  const getAverageScore = () => {
    if (leads.length === 0) return 0;
    const sum = leads.reduce((acc, lead) => acc + lead.opportunityScore, 0);
    return Math.round(sum / leads.length);
  };

  const getTotalProjectValue = () => {
    return leads.reduce((acc, lead) => acc + (lead.analysis?.estimatedEngagementValue || 0), 0);
  };

  const getIndustryDistribution = () => {
    const distribution: { [key: string]: number } = {};
    leads.forEach((l) => {
      distribution[l.industry] = (distribution[l.industry] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, count]) => ({ name, count }));
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans select-none" id="app-container">
      {/* Upper Navigation Rail */}
      <header className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img 
              src={clartechLogo} 
              alt="Clartech Logo" 
              className="w-10 h-10 rounded-xl object-cover border border-brand-500/30 shadow-lg shadow-brand-500/10"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Agent Engine Online"></span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-slate-100 text-base tracking-tight leading-none">Clartech Growth Agent</h1>
              <span className="text-[9px] bg-brand-500/15 text-brand-400 font-mono px-2 py-0.5 rounded border border-brand-500/20 font-bold uppercase">ENTERPRISE</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">B2B Outbound Intel & Pipelines</p>
          </div>
        </div>

        {/* View Toggle Pills */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full shrink-0">
          <button
            onClick={() => setActiveView('pipeline')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wide font-mono transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeView === 'pipeline' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> <span className="hidden xs:inline sm:inline">Pipeline</span> CRM
          </button>
          <button
            onClick={() => setActiveView('agent')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wide font-mono transition flex items-center justify-center gap-2 cursor-pointer relative whitespace-nowrap ${
              activeView === 'agent' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Discovery Agent
            {agentStatus.status !== 'idle' && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setActiveView('insights')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wide font-mono transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeView === 'insights' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> ICP Insights
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <AnimatePresence mode="wait">
          {/* VIEW 1: PIPELINE CRM */}
          {activeView === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {loadingLeads ? (
                <div className="py-32 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  <p className="text-slate-500 text-sm font-mono">Accessing CRM Database...</p>
                </div>
              ) : (
                <CRMPipeline
                  leads={leads}
                  onSelectLead={setSelectedLead}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onDeleteLead={handleDeleteLead}
                  onTriggerAnalysis={handleTriggerAnalysis}
                  onOpenCreateModal={() => setShowCreateModal(true)}
                  isAnalysingId={isAnalysingId}
                />
              )}
            </motion.div>
          )}

          {/* VIEW 2: AGENT CONTROL CENTER */}
          {activeView === 'agent' && (
            <motion.div
              key="agent"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <AgentTerminal
                status={agentStatus}
                logs={agentLogs}
                onTriggerDiscovery={handleTriggerDiscovery}
                isLoading={agentStatus.status !== 'idle'}
                leads={leads}
                onTriggerAnalysis={handleTriggerAnalysis}
                onTriggerDecisionFinder={handleTriggerDecisionFinder}
                onTriggerOutreachDraft={handleTriggerOutreachDraft}
                onTriggerCRMSync={handleTriggerCRMSync}
                onUpdateLeadDetails={handleUpdateLeadDetails}
                onUpdateLeadStatus={handleUpdateLeadStatus}
              />
            </motion.div>
          )}

          {/* VIEW 3: ICP ANALYTICS */}
          {activeView === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">Ideal Customer Profile Insights</h2>
                <p className="text-xs text-slate-400 mt-1">Real-time statistics of prospects matching Clartech's target industry and regional scope.</p>

                {/* Top Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-6">
                  <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl">
                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Total Filed Leads</div>
                    <div className="text-2xl font-bold font-mono text-slate-200 mt-1">{leads.length}</div>
                    <div className="text-[10px] text-brand-400 mt-2 font-medium">REAL ENTITY DISCOVERY</div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl">
                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Estimated pipeline value</div>
                    <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(getTotalProjectValue())}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-2 font-medium">CUSTOM ENGAGEMENTS</div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl">
                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Avg opportunity score</div>
                    <div className="text-2xl font-bold font-mono text-slate-200 mt-1">{getAverageScore()}%</div>
                    <div className="text-[10px] text-indigo-400 mt-2 font-medium">ICP QUALIFIED FIT</div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl">
                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Contact rate</div>
                    <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                      {leads.length > 0 
                        ? Math.round((leads.filter(l => ['Contacted', 'Engaged'].includes(l.status)).length / leads.length) * 100) 
                        : 0}%
                    </div>
                    <div className="text-[10px] text-rose-400 mt-2 font-medium">CONVERSION OUTBOUND</div>
                  </div>
                </div>

                {/* Sub panels - Bento styles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Industry breakdown */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider mb-4">Pipeline Sector Distribution</h3>
                    <div className="space-y-4">
                      {getIndustryDistribution().map((item) => {
                        const ratio = Math.round((item.count / leads.length) * 100);
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium text-slate-300">
                              <span>{item.name}</span>
                              <span className="font-mono text-slate-400">{item.count} Leads ({ratio}%)</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-brand-500 h-1.5 rounded-full" 
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {leads.length === 0 && (
                        <div className="text-center py-12 text-xs text-slate-500 font-mono">No sector distribution records.</div>
                      )}
                    </div>
                  </div>

                  {/* Clartech Offerings */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-200 uppercase font-mono tracking-wider">Suggested Studio Solutions</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                        <span className="font-bold text-slate-200 block">Intelligent Chatbots</span>
                        <span className="text-slate-500 block mt-1">Deploy Gemini LLM reasoning agents to answer customer inquiries.</span>
                      </div>
                      
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                        <span className="font-bold text-slate-200 block">Custom Customer Portals</span>
                        <span className="text-slate-500 block mt-1">Replace complex dispatcher/client spreadsheets with unified React hubs.</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                        <span className="font-bold text-slate-200 block">OCR Data Extractors</span>
                        <span className="text-slate-500 block mt-1">Parse bills of lading, registration pdfs, and documents via LLM pipelines.</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                        <span className="font-bold text-slate-200 block">Mobile Web Apps</span>
                        <span className="text-slate-500 block mt-1">Develop fast, hybrid mobile apps to boost youth/ministry engagement.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-out detail drawer */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailsDrawer
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onUpdateLeadDetails={handleUpdateLeadDetails}
            onTriggerAnalysis={handleTriggerAnalysis}
            isAnalysing={isAnalysingId === selectedLead.id}
          />
        )}
      </AnimatePresence>

      {/* Create custom lead Modal */}
      {showCreateModal && (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateManualLead}
        />
      )}
    </div>
  );
}
