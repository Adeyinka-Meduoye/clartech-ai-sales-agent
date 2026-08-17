export type LeadStatus =
  | 'Discovered'
  | 'Researching'
  | 'Drafted'
  | 'Approved'
  | 'Contacted'
  | 'Engaged'
  | 'Call Scheduled'
  | 'Converted'
  | 'Rejected';

export interface ContactDetails {
  email?: string;
  phone?: string;
  linkedin?: string;
  facebook?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface OpportunityAnalysis {
  executiveSummary: string;
  companyOverview: string;
  industry: string;
  estimatedGrowthStage: string;
  businessChallenges: string[];
  aiOpportunities: string[];
  automationOpportunities: string[];
  recommendedClartechServices: string[];
  estimatedProjectComplexity: 'Low' | 'Medium' | 'High';
  estimatedEngagementValue: number; // in USD
  confidenceScore: number; // 0-100
  techMaturity?: string;
  buyingSignals?: string[];
}

export interface Lead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  country: string;
  employeeCount: number;
  decisionMaker: string;
  jobTitle: string;
  contactDetails: ContactDetails;
  painPoints: string[];
  opportunityScore: number; // 0-100
  recommendedServices: string[];
  emailDraft: string;
  emailSubject?: string;
  followUp2Subject?: string;
  followUp2Body?: string;
  followUp4Subject?: string;
  followUp4Body?: string;
  followUp6Subject?: string;
  followUp6Body?: string;
  followUp8Subject?: string;
  followUp8Body?: string;
  sentStages?: { [stage: string]: string }; // Tracks sent date for each cadence stage
  linkedin?: string;
  facebook?: string;
  followUpDate: string; // YYYY-MM-DD
  status: LeadStatus;
  analysis?: OpportunityAnalysis;
  emailSent?: boolean;
  emailSentDate?: string;
  repliesReceived?: string[];
  crmNotes?: string;
  internalNotes?: InternalNote[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export type AgentStatusType = 'idle' | 'searching' | 'analyzing' | 'drafting';

export interface AgentStatus {
  status: AgentStatusType;
  currentTask?: string;
  leadsDiscoveredCount: number;
  leadsAnalyzedCount: number;
  emailsDraftedCount: number;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface ICPConfig {
  regions: string[];
  industries: string[];
  companySizes: string[]; // e.g. "5-20", "20-100", "100-500"
  decisionMakers: string[];
}
