import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Mail, 
  Clipboard, 
  Check, 
  Send, 
  Building, 
  User, 
  Briefcase, 
  Coins, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  Phone,
  Linkedin,
  MapPin,
  ExternalLink,
  Edit3,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Lead, LeadStatus, InternalNote } from '../types';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  currentUser: { name: string; role: string; canDelete: boolean } | null;
  onClose: () => void;
  onUpdateLeadStatus: (id: string, status: LeadStatus) => void;
  onUpdateLeadDetails: (id: string, updatedFields: Partial<Lead>) => void;
  onTriggerAnalysis: (id: string) => void;
  onTriggerDecisionFinder?: (id: string, role: string) => void;
  isAnalysing: boolean;
}

export default function LeadDetailsDrawer({
  lead,
  currentUser,
  onClose,
  onUpdateLeadStatus,
  onUpdateLeadDetails,
  onTriggerAnalysis,
  onTriggerDecisionFinder,
  isAnalysing
}: LeadDetailsDrawerProps) {
  if (!lead) return null;

  const SIGNATURE = "\n\nAdeyinka Meduoye,\nPrincipal AI Solutions Architect,\nClartech\nhttps://clartech.xyz/";
  const getFormattedDraft = (draft?: string) => {
    if (!draft) return `Hi there,${SIGNATURE}`;
    if (!draft.includes('Adeyinka Meduoye')) {
      return draft.trim() + SIGNATURE;
    }
    return draft;
  };

  const [activeSubTab, setActiveSubTab] = useState<'report' | 'outreach' | 'crm'>('report');
  const [emailStage, setEmailStage] = useState<'initial' | 'fu_2' | 'fu_4' | 'fu_6' | 'fu_8'>('initial');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [emailSubject, setEmailSubject] = useState(lead.emailSubject || `AI workflow acceleration & custom architecture for ${lead.companyName}`);
  const [emailText, setEmailText] = useState(getFormattedDraft(lead.emailDraft));
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [contactName, setContactName] = useState(lead.decisionMaker || '');
  const [contactTitle, setContactTitle] = useState(lead.jobTitle || '');
  const [contactEmail, setContactEmail] = useState(lead.contactDetails.email || '');
  const [contactPhone, setContactPhone] = useState(lead.contactDetails.phone || '');
  const [contactLinkedin, setContactLinkedin] = useState(lead.contactDetails.linkedin || '');
  const [customNotes, setCustomNotes] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState(lead.assignedTo || '');
  const [gdprChecked, setGdprChecked] = useState(true);
  const [canSpamChecked, setCanSpamChecked] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [internalNotesList, setInternalNotesList] = useState<InternalNote[]>(lead.internalNotes || []);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isNotePreview, setIsNotePreview] = useState(false);

  const handleAddInternalNote = () => {
    if (!newNoteContent.trim()) return;
    const newNote: InternalNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      author: currentUser?.name || 'Admin',
      content: newNoteContent.trim(),
      timestamp: new Date().toLocaleString()
    };
    const updated = [newNote, ...internalNotesList];
    setInternalNotesList(updated);
    setNewNoteContent('');
    onUpdateLeadDetails(lead.id, { internalNotes: updated });
  };

  const handleDeleteInternalNote = (noteId: string) => {
    const updated = internalNotesList.filter(n => n.id !== noteId);
    setInternalNotesList(updated);
    onUpdateLeadDetails(lead.id, { internalNotes: updated });
  };

  const insertFormatting = (prefix: string, suffix = '') => {
    setNewNoteContent(prev => prev + `${prefix}note text${suffix}`);
  };

  const getTemplateForStage = (stage: 'initial' | 'fu_2' | 'fu_4' | 'fu_6' | 'fu_8') => {
    const cName = contactName || lead.decisionMaker || 'there';
    const ind = lead.industry || 'technology';
    const country = lead.country || 'your region';
    if (stage === 'initial') {
      return {
        subject: lead.emailSubject || `AI workflow acceleration & custom architecture for ${lead.companyName}`,
        body: getFormattedDraft(lead.emailDraft)
      };
    } else if (stage === 'fu_2') {
      return {
        subject: lead.followUp2Subject || `Following up (Day 2): AI & workflow automation for ${lead.companyName}`,
        body: lead.followUp2Body || getFormattedDraft(`Hi ${cName},\n\nWanted to quickly circle back on my initial note regarding eliminating manual workflow bottlenecks at ${lead.companyName}.\n\nWe recently helped a similar ${ind} leader automate their pipeline with a 40% efficiency gain in weeks.\n\nWould a brief 10-minute technical brief next week make sense?`)
      };
    } else if (stage === 'fu_4') {
      return {
        subject: lead.followUp4Subject || `Quick case study (Day 4): 40% efficiency gain in ${ind} / Clartech`,
        body: lead.followUp4Body || getFormattedDraft(`Hi ${cName},\n\nI know things move fast at ${lead.companyName}. Thought you might appreciate seeing how we deployed autonomous AI agents to eliminate manual overhead for enterprise teams.\n\nHappy to share a 2-page executive brief if this is top of mind.`)
      };
    } else if (stage === 'fu_6') {
      return {
        subject: lead.followUp6Subject || `Engineering architecture briefing (Day 6) for ${lead.companyName}`,
        body: lead.followUp6Body || getFormattedDraft(`Hi ${cName},\n\nChecking in one more time this quarter. If scaling ${ind} operations or deploying custom AI agents is on your roadmap for ${country}, let's connect.\n\nAre you open to a brief introductory chat next Tuesday?`)
      };
    } else {
      return {
        subject: lead.followUp8Subject || `Final check-in (Day 8) / Clartech AI Solutions`,
        body: lead.followUp8Body || getFormattedDraft(`Hi ${cName},\n\nI'll assume timing isn't right right now for ${lead.companyName}. I'll leave our previous notes on file in case your engineering priorities shift later this quarter.\n\nWishing you continued success in ${country}!`)
      };
    }
  };

  const handleSwitchStage = (newStage: 'initial' | 'fu_2' | 'fu_4' | 'fu_6' | 'fu_8') => {
    // Save current stage edits first
    const updates: Partial<Lead> = {};
    if (emailStage === 'initial') {
      updates.emailSubject = emailSubject;
      updates.emailDraft = emailText;
    } else if (emailStage === 'fu_2') {
      updates.followUp2Subject = emailSubject;
      updates.followUp2Body = emailText;
    } else if (emailStage === 'fu_4') {
      updates.followUp4Subject = emailSubject;
      updates.followUp4Body = emailText;
    } else if (emailStage === 'fu_6') {
      updates.followUp6Subject = emailSubject;
      updates.followUp6Body = emailText;
    } else if (emailStage === 'fu_8') {
      updates.followUp8Subject = emailSubject;
      updates.followUp8Body = emailText;
    }
    onUpdateLeadDetails(lead.id, updates);

    setEmailStage(newStage);
    const template = getTemplateForStage(newStage);
    setEmailSubject(template.subject);
    setEmailText(template.body);
  };

  const prevLeadIdRef = React.useRef(lead.id);
  const prevEmailStageRef = React.useRef(emailStage);

  React.useEffect(() => {
    if (lead.id !== prevLeadIdRef.current || emailStage !== prevEmailStageRef.current) {
      prevLeadIdRef.current = lead.id;
      prevEmailStageRef.current = emailStage;
      const template = getTemplateForStage(emailStage);
      setEmailSubject(template.subject);
      setEmailText(template.body);
    }
    setContactName(lead.decisionMaker || '');
    setContactTitle(lead.jobTitle || '');
    setContactEmail(lead.contactDetails.email || '');
    setContactPhone(lead.contactDetails.phone || '');
    setContactLinkedin(lead.contactDetails.linkedin || '');
    setCustomNotes(lead.crmNotes || '');
    setAssignedAdmin(lead.assignedTo || '');
    setInternalNotesList(lead.internalNotes || []);
  }, [lead.id, emailStage, lead.decisionMaker, lead.jobTitle, lead.contactDetails, lead.crmNotes, lead.assignedTo, lead.internalNotes]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveContactDetails = () => {
    const stageUpdates: Partial<Lead> = {
      decisionMaker: contactName,
      jobTitle: contactTitle,
      contactDetails: {
        email: contactEmail,
        phone: contactPhone,
        linkedin: contactLinkedin
      },
      crmNotes: customNotes,
      assignedTo: assignedAdmin !== undefined ? (assignedAdmin || undefined) : lead.assignedTo
    };
    if (emailStage === 'initial') {
      stageUpdates.emailSubject = emailSubject;
      stageUpdates.emailDraft = emailText;
    } else if (emailStage === 'fu_2') {
      stageUpdates.followUp2Subject = emailSubject;
      stageUpdates.followUp2Body = emailText;
    } else if (emailStage === 'fu_4') {
      stageUpdates.followUp4Subject = emailSubject;
      stageUpdates.followUp4Body = emailText;
    } else if (emailStage === 'fu_6') {
      stageUpdates.followUp6Subject = emailSubject;
      stageUpdates.followUp6Body = emailText;
    } else if (emailStage === 'fu_8') {
      stageUpdates.followUp8Subject = emailSubject;
      stageUpdates.followUp8Body = emailText;
    }

    onUpdateLeadDetails(lead.id, stageUpdates);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSendEmail = async (isFollowUp = false) => {
    if (!contactEmail) {
      alert('Please verify or add a decision maker email address in the "CRM Coordinates" tab before sending outreach.');
      return;
    }
    handleSaveContactDetails();
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          recipientEmail: contactEmail,
          recipientName: contactName,
          companyName: lead.companyName,
          subject: emailSubject,
          body: emailText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      let daysToAdd = 2; // Day 2 after initial
      if (emailStage === 'fu_2') daysToAdd = 4; // Day 4 after FU1
      else if (emailStage === 'fu_4') daysToAdd = 6; // Day 6 after FU2
      else if (emailStage === 'fu_6') daysToAdd = 8; // Day 8 after FU3
      else if (emailStage === 'fu_8') daysToAdd = 10; // Completed cycle

      const nextFollowUp = new Date(Date.now() + daysToAdd * 24 * 3600000).toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedSentStages = {
        ...(lead.sentStages || {}),
        [emailStage]: todayStr
      };

      onUpdateLeadStatus(lead.id, 'Contacted');
      onUpdateLeadDetails(lead.id, {
        emailSent: true,
        status: 'Contacted',
        sentStages: updatedSentStages,
        followUpDate: nextFollowUp
      });
      alert(`Email (${emailStage === 'initial' ? 'Initial Outreach (Day 0)' : emailStage.toUpperCase()}) successfully sent via Gmail SMTP to ${contactName} (${contactEmail})! Stage tagged as sent (${todayStr}).`);
    } catch (err: any) {
      console.error('Failed to send email:', err);
      alert(`Error sending email: ${err.message || err}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getComplexityBadgeColor = (complexity?: string) => {
    switch (complexity) {
      case 'High': return 'bg-rose-950/40 text-rose-300 border-rose-900/50';
      case 'Medium': return 'bg-amber-950/40 text-amber-300 border-amber-900/50';
      default: return 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="details-drawer-container">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slideout Panel */}
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-2xl bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl h-full">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-400 text-lg uppercase select-none">
              {lead.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg tracking-tight">{lead.companyName}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono">{lead.industry}</span>
                <span>•</span>
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-brand-400 transition flex items-center gap-1 font-mono"
                >
                  {lead.website} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls - Stacks vertically on mobile, responsive */}
        <div className="flex flex-col sm:flex-row border-b border-slate-800 bg-slate-950/40 shrink-0 p-2 sm:p-0 gap-1 sm:gap-0">
          <button
            onClick={() => setActiveSubTab('report')}
            className={`w-full sm:flex-1 py-3 px-4 text-xs font-semibold tracking-wide border-l-4 sm:border-l-0 sm:border-b-2 font-mono transition cursor-pointer flex items-center justify-between sm:justify-center gap-2 rounded-lg sm:rounded-none ${
              activeSubTab === 'report' ? 'border-brand-500 text-brand-400 bg-brand-500/10 sm:bg-brand-500/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Opportunity Report</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 sm:hidden text-slate-500" />
          </button>
          <button
            onClick={() => setActiveSubTab('outreach')}
            className={`w-full sm:flex-1 py-3 px-4 text-xs font-semibold tracking-wide border-l-4 sm:border-l-0 sm:border-b-2 font-mono transition cursor-pointer flex items-center justify-between sm:justify-center gap-2 rounded-lg sm:rounded-none ${
              activeSubTab === 'outreach' ? 'border-brand-500 text-brand-400 bg-brand-500/10 sm:bg-brand-500/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Outreach Draft</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 sm:hidden text-slate-500" />
          </button>
          <button
            onClick={() => setActiveSubTab('crm')}
            className={`w-full sm:flex-1 py-3 px-4 text-xs font-semibold tracking-wide border-l-4 sm:border-l-0 sm:border-b-2 font-mono transition cursor-pointer flex items-center justify-between sm:justify-center gap-2 rounded-lg sm:rounded-none ${
              activeSubTab === 'crm' ? 'border-brand-500 text-brand-400 bg-brand-500/10 sm:bg-brand-500/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>CRM Coordinates</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 sm:hidden text-slate-500" />
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OPPORTUNITY REPORT */}
          {activeSubTab === 'report' && (
            <div className="space-y-6 animate-fade-in" id="opportunity-report-tab">
              {lead.analysis ? (
                <>
                  {/* Financials Bento Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Engagement Value</div>
                      <div className="text-xl font-bold text-slate-200 font-mono mt-1">
                        {formatCurrency(lead.analysis.estimatedEngagementValue)}
                      </div>
                      <span className="text-[9px] text-brand-400 font-mono">EST. HOURLY CONTRACT</span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Project Complexity</div>
                      <div className={`inline-block border text-xs font-bold font-mono px-2.5 py-1 rounded-full mt-1.5 ${getComplexityBadgeColor(lead.analysis.estimatedProjectComplexity)}`}>
                        {lead.analysis.estimatedProjectComplexity}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Confidence Score</div>
                      <div className="text-xl font-bold text-brand-400 font-mono mt-1">
                        {lead.analysis.confidenceScore}%
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">ICP VIABILITY MATCH</span>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl p-5">
                    <h4 className="text-xs text-slate-400 uppercase tracking-wider font-mono font-semibold mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-400" /> Executive Summary
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{lead.analysis.executiveSummary}</p>
                  </div>

                  {/* Company Overview */}
                  <div>
                    <h4 className="text-xs text-slate-400 uppercase tracking-wider font-mono font-semibold mb-2">Company Overview</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{lead.analysis.companyOverview}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3 bg-slate-950/30 p-3 rounded-lg border border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-500 block">Growth Stage:</span>
                        <span className="font-semibold text-slate-300 font-mono mt-0.5 block">{lead.analysis.estimatedGrowthStage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Estimated Employees:</span>
                        <span className="font-semibold text-slate-300 font-mono mt-0.5 block">{lead.employeeCount} Employees</span>
                      </div>
                    </div>
                  </div>

                  {/* Pain Points to Identify */}
                  <div>
                    <h4 className="text-xs text-rose-400 uppercase tracking-wider font-mono font-semibold mb-3 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-500" /> Operational Pain Points (Evidence)
                    </h4>
                    <ul className="space-y-2.5">
                      {lead.analysis.businessChallenges.map((challenge, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities (AI & Automation) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                      <h5 className="text-xs font-semibold uppercase font-mono tracking-wider text-brand-400 mb-2.5">AI Opportunities</h5>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {lead.analysis.aiOpportunities.map((op, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-brand-500 select-none font-bold">+</span>
                            <span>{op}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                      <h5 className="text-xs font-semibold uppercase font-mono tracking-wider text-emerald-400 mb-2.5">Automation Opportunities</h5>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {lead.analysis.automationOpportunities.map((op, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 select-none font-bold">+</span>
                            <span>{op}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Clartech Services */}
                  <div>
                    <h4 className="text-xs text-brand-400 uppercase tracking-wider font-mono font-semibold mb-3">Recommended Clartech Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {lead.analysis.recommendedClartechServices.map((service, i) => (
                        <span key={i} className="bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
                  <div>
                    <h4 className="text-slate-300 font-semibold text-sm">Opportunity Profile Not Yet Generated</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Trigger the autonomous research agent to crawl, analyze, and construct full CRM metrics and personalized drafts for this company.</p>
                  </div>
                  <button
                    onClick={() => onTriggerAnalysis(lead.id)}
                    disabled={isAnalysing}
                    className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 mx-auto transition cursor-pointer"
                  >
                    {isAnalysing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analysing Website...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analyze Company Profile</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OUTREACH DRAFT */}
          {activeSubTab === 'outreach' && (
            <div className="space-y-6 animate-fade-in" id="outreach-draft-tab">
              {lead.emailDraft ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Outbound Mail Draft (Highly Personalized)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (isEditingEmail) {
                            handleSaveContactDetails();
                          }
                          setIsEditingEmail(!isEditingEmail);
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditingEmail ? 'Done Editing (Saved)' : 'Edit Draft'}</span>
                      </button>
                      <button
                        onClick={handleCopy}
                        className="text-xs bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3.5 h-3.5" />
                            <span>Copy Mail</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cadence Stage Selector */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Outreach & Follow-Up Cadence (View & Edit Drafts)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      <button
                        onClick={() => handleSwitchStage('initial')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-center flex flex-col items-center justify-center ${emailStage === 'initial' ? 'bg-brand-500 text-white shadow font-semibold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        <span>Initial (Day 0)</span>
                        {lead.sentStages?.['initial'] && (
                          <span className={`text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded ${emailStage === 'initial' ? 'bg-brand-700 text-brand-100' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                            ✓ Sent ({lead.sentStages['initial']})
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSwitchStage('fu_2')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-center flex flex-col items-center justify-center ${emailStage === 'fu_2' ? 'bg-brand-500 text-white shadow font-semibold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        <span>Follow-up 1 (Day 2)</span>
                        {lead.sentStages?.['fu_2'] && (
                          <span className={`text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded ${emailStage === 'fu_2' ? 'bg-brand-700 text-brand-100' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                            ✓ Sent ({lead.sentStages['fu_2']})
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSwitchStage('fu_4')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-center flex flex-col items-center justify-center ${emailStage === 'fu_4' ? 'bg-brand-500 text-white shadow font-semibold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        <span>Follow-up 2 (Day 4)</span>
                        {lead.sentStages?.['fu_4'] && (
                          <span className={`text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded ${emailStage === 'fu_4' ? 'bg-brand-700 text-brand-100' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                            ✓ Sent ({lead.sentStages['fu_4']})
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSwitchStage('fu_6')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-center flex flex-col items-center justify-center ${emailStage === 'fu_6' ? 'bg-brand-500 text-white shadow font-semibold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        <span>Follow-up 3 (Day 6)</span>
                        {lead.sentStages?.['fu_6'] && (
                          <span className={`text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded ${emailStage === 'fu_6' ? 'bg-brand-700 text-brand-100' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                            ✓ Sent ({lead.sentStages['fu_6']})
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSwitchStage('fu_8')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-center flex flex-col items-center justify-center ${emailStage === 'fu_8' ? 'bg-brand-500 text-white shadow font-semibold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                      >
                        <span>Follow-up 4 (Day 8)</span>
                        {lead.sentStages?.['fu_8'] && (
                          <span className={`text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded ${emailStage === 'fu_8' ? 'bg-brand-700 text-brand-100' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                            ✓ Sent ({lead.sentStages['fu_8']})
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {lead.sentStages?.[emailStage] && (
                    <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Outreach Notice:</strong> You already sent this stage ({emailStage.toUpperCase()}) to {lead.companyName} on <strong>{lead.sentStages[emailStage]}</strong>. Please review carefully to avoid duplicate outreach.
                      </span>
                    </div>
                  )}

                  {/* Email Subject Field */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Email Subject Line (High Open-Rate Design)
                    </label>
                    {isEditingEmail ? (
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-brand-500"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-100 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800 font-sans">
                        {emailSubject}
                      </div>
                    )}
                  </div>

                  {/* Mail Body Editor / Reader */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner">
                    {isEditingEmail ? (
                      <textarea
                        value={emailText}
                        onChange={(e) => setEmailText(e.target.value)}
                        className="w-full h-80 bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none font-mono leading-relaxed resize-y"
                      />
                    ) : (
                      <pre className="text-sm text-slate-300 font-sans whitespace-pre-wrap leading-relaxed select-text font-normal">
                        {emailText}
                      </pre>
                    )}
                  </div>

                  {/* GDPR & CAN-SPAM Compliance Checklists */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <h4 className="text-xs font-bold uppercase font-mono text-slate-300 tracking-wider">Privacy & Compliance Audit</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-start gap-2 text-xs text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={canSpamChecked}
                            onChange={(e) => setCanSpamChecked(e.target.checked)}
                            className="mt-0.5 rounded border-slate-800 text-brand-500 focus:ring-brand-500 bg-slate-950"
                          />
                          <div>
                            <span className="font-semibold block text-slate-200">CAN-SPAM Checklist</span>
                            <span className="text-slate-500 block mt-0.5 leading-relaxed">Sender identifier is clear; contains valid studio opt-out links.</span>
                          </div>
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-start gap-2 text-xs text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={gdprChecked}
                            onChange={(e) => setGdprChecked(e.target.checked)}
                            className="mt-0.5 rounded border-slate-800 text-brand-500 focus:ring-brand-500 bg-slate-950"
                          />
                          <div>
                            <span className="font-semibold block text-slate-200">GDPR Legitimate Interest</span>
                            <span className="text-slate-500 block mt-0.5 leading-relaxed">B2B email represents clear legitimate business interest alignment.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Send via Gmail SMTP CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleSendEmail(false)}
                      disabled={isSendingEmail || !contactEmail || !gdprChecked || !canSpamChecked}
                      className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed text-sm shadow-lg shadow-brand-500/10"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending via Gmail SMTP (useclartech@gmail.com)...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send via Gmail SMTP (useclartech@gmail.com)</span>
                        </>
                      )}
                    </button>
                    {!contactEmail && (
                      <p className="text-[10px] text-rose-400 mt-2 text-center leading-relaxed">
                        * Please verify or add a decision maker email address in the 'CRM Coordinates' tab before sending outreach.
                      </p>
                    )}
                  </div>

                  {/* Follow-Up Momentum & Cadence Card */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                        <h4 className="text-xs font-bold uppercase font-mono text-slate-300 tracking-wider">Automated Follow-Up Cadence</h4>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300">
                        Due: {lead.followUpDate || 'Not scheduled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      System automatically schedules follow-up momenta at Day 2, Day 4, Day 6, and Day 8 post-outreach. Switch stages above to preview, edit, and send each follow-up draft.
                    </p>
                    {lead.emailSent && (
                      <button
                        onClick={() => {
                          setEmailSubject(`Following up on AI & workflow optimization for ${lead.companyName}`);
                          setEmailText(`Hi ${contactName || 'there'},\n\nWanted to circle back on my previous note regarding eliminating manual bottlenecks at ${lead.companyName}.\n\nWe recently helped a similar ${lead.industry} leader automate their pipeline with a 40% efficiency gain.\n\nWould a 10-minute technical brief next week make sense?\n\nBest,\nAdeyinka Meduoye\nPrincipal AI Solutions Architect, Clartech\nhttps://clartech.xyz/`);
                          handleSendEmail(true);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-400" />
                        <span>Send Automated Follow-Up Email via Gmail SMTP</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-slate-500 italic">
                  Generate the Opportunity Report first to unlock highly personalized custom outbound emails.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CRM COORDINATES */}
          {activeSubTab === 'crm' && (
            <div className="space-y-6 animate-fade-in" id="crm-coordinates-tab">
              {currentUser?.canDelete && (
                <div className="bg-brand-500/10 border border-brand-500/30 p-4 rounded-xl space-y-2">
                  <label className="block text-[10px] uppercase font-mono text-brand-400 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Assign Lead to Admin (Super Admin Control)
                  </label>
                  {lead.assignedTo && lead.assignedTo.toLowerCase() !== 'adeyinka meduoye' ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Generated/Discovered by <strong className="text-slate-100">{lead.assignedTo}</strong>.
                      </span>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        Locked (User Owned)
                      </span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={assignedAdmin}
                        onChange={(e) => {
                          setAssignedAdmin(e.target.value);
                          onUpdateLeadDetails(lead.id, { assignedTo: e.target.value || undefined });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-sans cursor-pointer"
                      >
                        <option value="">Unassigned (Super Admin Only)</option>
                        <option value="Adeyinka Meduoye">Adeyinka Meduoye (Super Admin)</option>
                        <option value="Gloria Irabor">Gloria Irabor (CRM Operator)</option>
                      </select>
                      <p className="text-[10px] text-slate-400">
                        {assignedAdmin ? `Assigned to ${assignedAdmin}. Visible in their CRM view.` : 'Unassigned. Only visible to Super Admin.'}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-500" />
                    <h4 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">Target Coordinator Details</h4>
                  </div>
                  {onTriggerDecisionFinder && (
                    <button
                      onClick={() => onTriggerDecisionFinder(lead.id, lead.jobTitle || 'CEO')}
                      className="text-[10px] font-mono bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-1 rounded flex items-center gap-1 transition cursor-pointer"
                      title="Re-run Decision Finder Agent to resolve correct email address and fix bounce-back errors"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-run Finder (Fix Bounce)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Decision Maker Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition"
                      placeholder="Sarah Jenkins"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={contactTitle}
                      onChange={(e) => setContactTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition"
                      placeholder="Chief Operating Officer"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition font-mono"
                      placeholder="s.jenkins@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition font-mono"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1">
                      <Linkedin className="w-3 h-3" /> LinkedIn URI
                    </label>
                    <input
                      type="text"
                      value={contactLinkedin}
                      onChange={(e) => setContactLinkedin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition font-mono"
                      placeholder="linkedin.com/in/sarah-jenkins"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">
                    Strategic CRM Notes
                  </label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition h-20 resize-none leading-relaxed"
                    placeholder="Add logging notes about current response status, booking attempts, etc."
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleSaveContactDetails}
                    className={`font-medium text-xs px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      savedSuccess 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-brand-500 hover:bg-brand-600 text-white'
                    }`}
                  >
                    {savedSuccess ? <Check className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {savedSuccess ? 'Saved Successfully!' : 'Save CRM Profile'}
                  </button>
                </div>
              </div>

              {/* Rich Text Internal Notes & Strategy Board */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <h4 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">Rich Text Internal Notes & Strategy Journal</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                    {internalNotesList.length} {internalNotesList.length === 1 ? 'Note' : 'Notes'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-t-lg">
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer text-xs"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 italic transition cursor-pointer text-xs"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('- ')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs"
                        title="Bullet List"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('> ')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs"
                        title="Callout Box"
                      >
                        “ Quote
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsNotePreview(false)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${!isNotePreview ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNotePreview(true)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${isNotePreview ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {!isNotePreview ? (
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write internal team notes, qualification updates, call takeaways, or strategy details... (Supports Markdown / rich text formatting)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-b-lg px-3.5 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition h-32 resize-y leading-relaxed font-sans"
                    />
                  ) : (
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-b-lg px-3.5 py-3 text-sm text-slate-200 min-h-[128px] max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans border-t-0">
                      {newNoteContent ? newNoteContent : <span className="text-slate-600 italic">Nothing to preview yet...</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Logged as: <strong className="text-slate-300">{currentUser?.name || 'Admin'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleAddInternalNote}
                      disabled={!newNoteContent.trim()}
                      className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Note to Database</span>
                    </button>
                  </div>
                </div>

                {/* Notes Feed */}
                {internalNotesList.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800/80">
                    <h5 className="text-xs font-semibold uppercase font-mono text-slate-400">Saved Team Notes & History</h5>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {internalNotesList.map((note) => (
                        <div key={note.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-brand-500/10 text-brand-300 px-2 py-0.5 rounded border border-brand-500/20 font-semibold">
                                {note.author}
                              </span>
                              <span className="text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {note.timestamp}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteInternalNote(note.id)}
                              className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                              title="Delete Note"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                            {note.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Agent 5 CRM logs & simulated replies */}
              {(lead.crmNotes || (lead.repliesReceived && lead.repliesReceived.length > 0)) && (
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">Agent 5 Automated Logs</h4>
                  </div>

                  {lead.crmNotes && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-mono text-slate-500">Automated Synthesis Notes</label>
                      <div className="bg-slate-950/80 border border-slate-900/60 p-3 rounded-lg text-xs text-slate-300 leading-relaxed font-sans">
                        {lead.crmNotes}
                      </div>
                    </div>
                  )}

                  {lead.repliesReceived && lead.repliesReceived.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" /> Inbound Prospect Replies
                      </label>
                      <div className="space-y-2">
                        {lead.repliesReceived.map((reply, index) => (
                          <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-2 border-b border-slate-900/40 pb-1.5">
                              <span>From: {lead.decisionMaker || 'Contact'}</span>
                              <span>Received via Agent 5</span>
                            </div>
                            <pre className="text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                              {reply}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status workflow manager */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">Pipeline workflow</h4>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-2">Transition Pipeline State</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Discovered', 'Approved', 'Contacted', 'Engaged', 'Call Scheduled', 'Converted', 'Rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => onUpdateLeadStatus(lead.id, status)}
                        className={`py-2 px-2 rounded-lg border text-xs font-medium font-mono text-center transition cursor-pointer ${
                          lead.status === status
                            ? 'bg-brand-500/15 border-brand-500/60 text-brand-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Follow-up Target Date</label>
                    <input
                      type="date"
                      value={lead.followUpDate}
                      onChange={(e) => onUpdateLeadDetails(lead.id, { followUpDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Record Created</label>
                    <div className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2.5 text-xs text-slate-400 font-mono">
                      {new Date(lead.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Back / Close Bar */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-3 sm:hidden flex items-center justify-between z-20 shadow-2xl shrink-0">
          <div className="text-xs text-slate-400 truncate max-w-[200px]">
            Viewing <span className="text-slate-200 font-semibold">{lead.companyName}</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" /> Close & Back
          </button>
        </div>
      </div>
    </div>
  );
}
