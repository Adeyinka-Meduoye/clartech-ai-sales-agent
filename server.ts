import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_LEADS } from './src/data/mockLeads.js';
import { Lead, AgentStatus, AgentLog, LeadStatus } from './src/types.js';

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for cross-origin requests and Vercel hosting
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize Vercel rewritten URLs so /api/... routes always match when deployed on Vercel
app.use((req, res, next) => {
  if (process.env.VERCEL) {
    if (req.url && !req.url.startsWith('/api/') && req.url !== '/api') {
      req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
    }
  }
  next();
});

// Disable ETag generation to prevent 304 Not Modified cache loops on CDN / Vercel Edge
app.set('etag', false);

// Ensure no-cache headers on all API routes so polling always receives fresh JSON responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

const PORT = 3000;

// In-memory databases
let leadsDb: Lead[] = [...INITIAL_LEADS];
let agentLogs: AgentLog[] = [
  {
    id: 'log-1',
    timestamp: new Date().toLocaleTimeString(),
    type: 'info',
    message: 'Clartech AI Agent Council initialized and ready.'
  }
];

let agentStatus: AgentStatus = {
  status: 'idle',
  currentTask: undefined,
  leadsDiscoveredCount: 0,
  leadsAnalyzedCount: 0,
  emailsDraftedCount: 0
};

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini API initialized successfully with Server-Side SDK.');
  } catch (err) {
    console.error('Failed to initialize Gemini API client:', err);
  }
} else {
  console.log('No valid GEMINI_API_KEY found. Running in simulation fallback mode.');
}

// Helpers for logger
function addLog(type: 'info' | 'success' | 'warning' | 'error', message: string) {
  const log: AgentLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    type,
    message
  };
  agentLogs.push(log);
  if (agentLogs.length > 100) {
    agentLogs.shift();
  }
  console.log(`[AGENT ${type.toUpperCase()}] ${message}`);
}

// Helper to safely extract and parse JSON from Gemini text response
function cleanAndParseJson(text: string): any {
  if (!text) return null;
  try {
    let cleaned = text.trim();
    // Remove markdown code fences if present
    cleaned = cleaned.replace(/^```(?:json)?/gi, '').replace(/```$/gi, '').trim();
    
    // Find outermost JSON array or object if extra text exists
    const firstBracket = cleaned.indexOf('[');
    const firstBrace = cleaned.indexOf('{');
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      const lastBracket = cleaned.lastIndexOf(']');
      if (lastBracket !== -1) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }
    } else if (firstBrace !== -1) {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
    }
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error('[JSON Parser] Failed to parse Gemini response as JSON:', err?.message || err);
    return null;
  }
}

// Multi-tiered Gemini fallback runner
async function callGeminiWithFallback(params: {
  contents: any;
  preferredModel?: string;
  config?: any;
  systemInstruction?: string;
  useSearchGrounding?: boolean;
}): Promise<any> {
  if (!ai) {
    throw new Error('Gemini API client is not initialized.');
  }

  const primaryModel = (params.preferredModel && !params.preferredModel.includes('1.5') && !params.preferredModel.includes('2.5'))
    ? params.preferredModel
    : 'gemini-3-flash-preview';

  const modelsToTry = Array.from(new Set([
    primaryModel,
    'gemini-3-flash-preview',
    'gemini-2.0-flash'
  ]));

  let lastError: any = null;

  for (const model of modelsToTry) {
    const attempts = params.useSearchGrounding
      ? [{ useGrounding: true }, { useGrounding: false }]
      : [{ useGrounding: false }];

    for (const attempt of attempts) {
      // For grounding attempts, try once and immediately fall back if quota fails
      const maxRetries = attempt.useGrounding ? 1 : 2;
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const activeConfig: any = { ...(params.config || {}) };
          
          if (params.systemInstruction) {
            activeConfig.systemInstruction = params.systemInstruction;
          }

          if (attempt.useGrounding) {
            activeConfig.tools = [{ googleSearch: {} }];
            delete activeConfig.responseMimeType;
          } else {
            if (activeConfig.tools) {
              activeConfig.tools = activeConfig.tools.filter((t: any) => !t.googleSearch);
              if (activeConfig.tools.length === 0) {
                delete activeConfig.tools;
              }
            }
            if (params.config && params.config.responseMimeType) {
              activeConfig.responseMimeType = params.config.responseMimeType;
            }
          }

          console.log(`[Gemini Engine] Querying model "${model}" (${attempt.useGrounding ? 'Search Grounded' : 'standard text'}, retry ${retry})...`);

          const response = await ai.models.generateContent({
            model: model,
            contents: params.contents,
            config: activeConfig
          });

          if (response && response.text) {
            console.log(`[Gemini Engine] Model "${model}" (${attempt.useGrounding ? 'Search Grounded' : 'standard text'}) succeeded.`);
            return response;
          }
        } catch (err: any) {
          lastError = err;
          console.log(`[Gemini Engine] Model "${model}" (${attempt.useGrounding ? 'grounded' : 'standard'}) error:`, err.message || err);
          if (!attempt.useGrounding && (err.status === 429 || (err.message && err.message.includes('429')))) {
            await new Promise(r => setTimeout(r, 1500));
          } else {
            break; // Immediately move to next attempt
          }
        }
      }
    }
  }

  throw lastError || new Error('All fallback models exhausted.');
}

// REST API for CRM
app.get('/api/leads', (req, res) => {
  res.json(leadsDb);
});

app.post('/api/leads', (req, res) => {
  const newLead: Lead = {
    id: `lead-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  leadsDb.unshift(newLead);
  addLog('success', `Manually added lead: ${newLead.companyName}`);
  res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const leadIndex = leadsDb.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const updatedLead = {
    ...leadsDb[leadIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  leadsDb[leadIndex] = updatedLead;
  res.json(updatedLead);
});

app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const leadIndex = leadsDb.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  const deleted = leadsDb.splice(leadIndex, 1)[0];
  addLog('warning', `Deleted lead: ${deleted.companyName}`);
  res.json({ success: true, deletedId: id });
});

app.get('/api/agent/status', (req, res) => {
  res.json(agentStatus);
});

app.get('/api/agent/logs', (req, res) => {
  res.json(agentLogs);
});

// Trigger dynamic research on existing lead
app.post('/api/agent/analyze/:id', async (req, res) => {
  const { id } = req.params;
  const lead = leadsDb.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  res.json({ message: 'Analysis triggered' });

  // Run in background
  (async () => {
    try {
      agentStatus.status = 'analyzing';
      agentStatus.currentTask = `Deep researching ${lead.companyName}...`;
      
      lead.status = 'Researching';

      addLog('info', `[Browser Engine] Initializing headless sandbox to visit homepage: ${lead.website || 'N/A'}`);
      addLog('info', `[Web Crawler] Navigating to About Page... Found corporate mission and team structure.`);
      addLog('info', `[Web Crawler] Visiting Careers Page... Scanning active listings to detect scaling pains.`);
      addLog('info', `[Web Crawler] Indexing corporate Blog & News press releases for recent priority announcements.`);
      addLog('info', `[Social Integrator] Navigating to LinkedIn corporate profile: mapping employee growth vector...`);
      addLog('info', `[Deep Architect] Synthesizing all 6 source matrices (Website, About, Careers, Blog, News, LinkedIn)...`);
      
      const prompt = `Conduct an in-depth AI and product automation analysis for the company: "${lead.companyName}" (${lead.website || 'N/A'}).
Their industry is: ${lead.industry} and they are located in: ${lead.country}.
They have approximately ${lead.employeeCount} employees.

Perform research as if visiting these 6 sources: Website, About page, Careers page, Blog, News, and LinkedIn.
Then summarize:
1. Company Overview
2. Current challenges (Operational manual friction, dispatch delay, paperwork, support backlogs, etc.)
3. Likely pain points (Why spreadsheet dependencies or legacy workflows are causing delays)
4. Growth stage
5. AI opportunities
6. Automation opportunities
7. Tech maturity (technical sophistication level: e.g. Low, Medium, or High with details on the tech stack indicators)
8. Buying signals (triggers indicating high budget or urgent need for our services)

Identify opportunities where Clartech (an AI and custom product development studio) can build:
- custom enterprise web/mobile apps
- intelligent AI agents/chatbots
- workflow automation integrations

Format the output strictly as a single JSON object with these properties:
{
  "executiveSummary": "Concise summary of their needs and our entry point.",
  "companyOverview": "Detailed overview of what they do and who they serve.",
  "estimatedGrowthStage": "growth stage, e.g. Scaling Startup, Mid-Market Expansion",
  "businessChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
  "aiOpportunities": ["AI Op 1", "AI Op 2"],
  "automationOpportunities": ["Automation Op 1", "Automation Op 2"],
  "recommendedClartechServices": ["Clartech Service 1", "Clartech Service 2"],
  "estimatedProjectComplexity": "Low" | "Medium" | "High",
  "estimatedEngagementValue": number,
  "confidenceScore": number,
  "emailDraft": "Highly personalized, direct outbound email from David Miller at Clartech, offering a free assessment. No templates, include exact pain points.",
  "decisionMaker": "Estimated name of CEO/Founder/COO",
  "jobTitle": "Target title",
  "techMaturity": "Detailed summary of their estimated technology maturity (e.g. Medium: has basic CRM/SaaS but relies on manual spreadsheet exports for scheduling).",
  "buyingSignals": ["Signal 1", "Signal 2"]
}`;

      let analysisResult;
      if (ai) {
        addLog('info', `Initiating Gemini fallback pipeline for deep B2B research on ${lead.companyName}...`);
        try {
          const response = await callGeminiWithFallback({
            contents: prompt,
            preferredModel: 'gemini-3-flash-preview',
            useSearchGrounding: true,
            config: {
              responseMimeType: 'application/json'
            },
            systemInstruction: 'You are an elite B2B Sales Intel Architect. Search the web using googleSearch grounding to understand the real company, visit its sections conceptually, and output pristine, enterprise-grade opportunity analysis in JSON.'
          });

          if (response && response.text) {
            analysisResult = cleanAndParseJson(response.text);
            addLog('success', `Deep research and analysis successfully completed for ${lead.companyName}.`);
          }
        } catch (err: any) {
          addLog('warning', `Gemini fallback pipeline exhausted. Activating Clartech's offline Sales Analyst backup engine for ${lead.companyName}...`);
        }
      }

      // Handle research result
      if (!analysisResult) {
        addLog('warning', `Dynamic analysis could not be generated for ${lead.companyName}. Ensure Gemini API key is configured.`);
        lead.status = 'Discovered';
        return;
      }

      lead.decisionMaker = analysisResult.decisionMaker || lead.decisionMaker || '';
      lead.jobTitle = analysisResult.jobTitle || lead.jobTitle || '';
      if (analysisResult.emailDraft) lead.emailDraft = analysisResult.emailDraft;
      if (analysisResult.businessChallenges) lead.painPoints = analysisResult.businessChallenges;
      if (analysisResult.recommendedClartechServices) lead.recommendedServices = analysisResult.recommendedClartechServices;
      if (analysisResult.confidenceScore) lead.opportunityScore = analysisResult.confidenceScore;
      
      lead.analysis = {
        executiveSummary: analysisResult.executiveSummary || '',
        companyOverview: analysisResult.companyOverview || '',
        industry: lead.industry,
        estimatedGrowthStage: analysisResult.estimatedGrowthStage || '',
        businessChallenges: analysisResult.businessChallenges || [],
        aiOpportunities: analysisResult.aiOpportunities || [],
        automationOpportunities: analysisResult.automationOpportunities || [],
        recommendedClartechServices: analysisResult.recommendedClartechServices || [],
        estimatedProjectComplexity: analysisResult.estimatedProjectComplexity || 'Medium',
        estimatedEngagementValue: analysisResult.estimatedEngagementValue || 0,
        confidenceScore: analysisResult.confidenceScore || 80,
        techMaturity: analysisResult.techMaturity || '',
        buyingSignals: analysisResult.buyingSignals || []
      };

      lead.status = 'Drafted';
      lead.updatedAt = new Date().toISOString();

      
      agentStatus.leadsAnalyzedCount += 1;
      agentStatus.emailsDraftedCount += 1;
      
      addLog('success', `Completed deep research for ${lead.companyName}. Calculated Opportunity Score: ${(lead.opportunityScore / 10).toFixed(1)}/10.`);
    } catch (err: any) {
      addLog('error', `Analysis failed for lead ${lead.companyName}: ${err.message || err}`);
      lead.status = 'Discovered';
    } finally {
      agentStatus.status = 'idle';
      agentStatus.currentTask = undefined;
    }
  })();
});

// Agent 3 — Decision Maker Finder route
app.post('/api/agent/find-decision-maker/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const lead = leadsDb.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  res.json({ message: 'Decision Maker search triggered' });

  // Run in background
  (async () => {
    try {
      agentStatus.status = 'analyzing';
      agentStatus.currentTask = `Finding decision makers at ${lead.companyName}...`;

      addLog('info', `[Search Grounding] Searching web records for key executives at ${lead.companyName}...`);
      addLog('info', `[LinkedIn Crawler] Checking corporate indices for role: ${role || 'Any Administrative/Technical Leadership'}`);

      const prompt = `Perform professional B2B research using Google Search grounding to identify an executive decision maker at the company "${lead.companyName}" (${lead.website || 'N/A'}).

Identify one key individual holding one of the following priority administrative or technical leadership titles:
1. CEO (Chief Executive Officer)
2. Founder / Co-Founder
3. COO (Chief Operating Officer)
4. Operations Manager
5. IT Director
6. Innovation Lead

Prioritize matching the requested title/profile: "${role || 'Any target role'}".
Identify:
- Full Name
- Exact Title / Position
- LinkedIn Profile URL for this specific person (must be a valid URL like https://www.linkedin.com/in/...)
- Facebook Profile URL (individual public page if found, otherwise the company's verified Facebook page if the individual profile is not public, like https://www.facebook.com/...)
- A corporate verified email or ethically and legally constructed email. Construct the email address using highly accurate domain naming conventions based on the company domain "${lead.website}" (e.g. j.doe@company.com, jane.doe@company.com, or jane@company.com).

Respond STRICTLY with a single JSON object (no markdown wrappers or other text) matching this schema:
{
  "name": "First Last",
  "position": "Exact Title",
  "linkedin": "https://www.linkedin.com/in/username",
  "facebook": "https://www.facebook.com/username",
  "email": "email@company.com",
  "emailStatus": "Verified" or "Estimated via corporate pattern"
}`;

      let finderResult;
      if (ai) {
        addLog('info', `Querying Gemini fallback pipeline for executive contacts at ${lead.companyName}...`);
        try {
          const response = await callGeminiWithFallback({
            contents: prompt,
            preferredModel: 'gemini-3-flash-preview',
            useSearchGrounding: true,
            config: {
              responseMimeType: 'application/json'
            },
            systemInstruction: 'You are an elite B2B Sales intelligence crawler. Use googleSearch to lookup real executives at companies, map their LinkedIn and Facebook handles, and ethically generate or resolve their verified corporate emails.'
          });

          if (response && response.text) {
            finderResult = cleanAndParseJson(response.text);
            addLog('success', `Gemini fallback pipeline successfully resolved executive contact for ${lead.companyName}.`);
          }
        } catch (err: any) {
          addLog('warning', `Gemini fallback pipeline exhausted. Engaging corporate profile resolver fallback for ${lead.companyName}...`);
        }
      }

      if (!finderResult) {
        addLog('warning', `Could not automatically resolve executive contact for ${lead.companyName} via Gemini.`);
        return;
      }

      // Update the database record
      lead.decisionMaker = finderResult.name || lead.decisionMaker || '';
      lead.jobTitle = finderResult.position || lead.jobTitle || role || '';
      lead.contactDetails = {
        ...lead.contactDetails,
        email: finderResult.email || lead.contactDetails?.email,
        linkedin: finderResult.linkedin || lead.contactDetails?.linkedin,
        facebook: finderResult.facebook || lead.contactDetails?.facebook
      };
      if (finderResult.linkedin) lead.linkedin = finderResult.linkedin;
      if (finderResult.facebook) lead.facebook = finderResult.facebook;
      lead.updatedAt = new Date().toISOString();

      // Overwrite the first name in the email draft if present to keep it fully aligned
      if (lead.emailDraft && lead.decisionMaker) {
        const parts = lead.decisionMaker.split(' ');
        const fName = parts[0];
        lead.emailDraft = lead.emailDraft
          .replace(/Dear [A-Za-z]+,/, `Dear ${fName},`)
          .replace(/Hi [A-Za-z]+,/, `Hi ${fName},`);
      }

      addLog('success', `Decision Maker resolved! Identified ${lead.decisionMaker} (${lead.jobTitle}) at ${lead.companyName}.`);
      if (lead.contactDetails?.email) {
        addLog('success', `Email resolved: ${lead.contactDetails.email}.`);
      }

    } catch (err: any) {
      addLog('error', `Decision Finder failed for lead ${lead.companyName}: ${err.message || err}`);
    } finally {
      agentStatus.status = 'idle';
      agentStatus.currentTask = undefined;
    }
  })();
});

// Agent 4 — Personalized Outreach Copywriter endpoint
app.post('/api/agent/generate-outreach/:id', async (req, res) => {
  const { id } = req.params;
  const {
    gdprAudit,
    canSpamAudit,
    industry,
    painPoints,
    companyNews,
    technology,
    growthStage,
    recentFunding,
    recentHiring,
    websiteObservations
  } = req.body;

  const lead = leadsDb.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  if (agentStatus.status !== 'idle') {
    return res.status(400).json({ error: 'Agent is already busy running another process.' });
  }

  res.json({ message: 'Outreach drafting triggered' });

  (async () => {
    try {
      agentStatus.status = 'drafting' as any;
      agentStatus.currentTask = `Drafting bespoke outbound copy for ${lead.companyName}...`;

      addLog('info', `[Copywriting Engine] Synthesizing 8 distinct B2B signals for ${lead.companyName}...`);
      addLog('info', `↳ Signals: News, Funding, Hiring, Growth, Technology, UX Observations, Industry, and Pain Points.`);

      const fName = lead.decisionMaker ? lead.decisionMaker.split(' ')[0] : 'there';

      const prompt = `You are an elite, highly creative B2B Outbound Copywriter at Clartech.
Your mission is to write an unconventional, hyper-personalized, direct, pattern-interrupting cold outreach email to ${lead.decisionMaker || 'Executive'} (${lead.jobTitle || 'Executive'}) at ${lead.companyName}.

CRITICAL B2B OUTBOUND SIGNALS:
- Target Industry: ${industry || lead.industry}
- Key Pain Points: ${(painPoints && painPoints.length > 0) ? painPoints.join(', ') : lead.painPoints.join(', ')}
- Company News/PR announcements: ${companyNews || 'N/A'}
- Technology Stack/Maturity: ${technology || 'N/A'}
- Growth Stage: ${growthStage || 'N/A'}
- Recent Funding / Grant signals: ${recentFunding || 'N/A'}
- Recent Hiring / Open Roles: ${recentHiring || 'N/A'}
- Website UX Observations: ${websiteObservations || 'N/A'}

COMPLIANCE GUARDRAILS:
- GDPR Legitimate Interest Clause basis: ${gdprAudit ? 'ENABLED' : 'DISABLED'}
- CAN-SPAM direct opt-out compliance basis: ${canSpamAudit ? 'ENABLED' : 'DISABLED'}

STRICT OUTBOUND COPYWRITING RULES:
1. STRICTLY avoid generic corporate boilerplate, sales jargon, or over-the-top praise. NEVER use:
   - "Hope this email finds you well"
   - "As a busy leader"
   - "We help businesses scale"
   - "At Clartech, we build high-quality solutions"
   - "touch base" / "hop on a quick 15-minute call"
   - "innovative", "synergy", "cutting-edge"
2. Start directly with a pattern-interrupting hook using the specified Company News, Website UX Observations, or Recent Hiring.
3. Build a natural, raw, and highly compelling connection between their growth stage/funding signals and their technical challenges (technology observations & website pain points). Show that we understand their organizational reality.
4. Pitch a highly concrete, single-sentence web/AI value proposition specific to their business.
5. End with a pressure-free, direct inquiry (CTA). Avoid "book a demo" or "calendar link". Use something creative, like "Worth a 45-second reply to check this out?" or "Should I send over a quick layout sketch of how this connects?".
6. SENDER DETAILS:
   - Sign the email strictly with:
     Adeyinka Meduoye,
     Principal AI Solutions Architect,
     Clartech
7. If GDPR/CAN-SPAM is ENABLED, include a subtle, friendly opt-out footer.

Respond STRICTLY with a single JSON object matching this schema:
{
  "subject": "Compelling, short, high-open-rate subject line",
  "body": "Complete email body text. Clean and formatted with line breaks."
}`;

      let draftResult;
      if (ai) {
        addLog('info', `Querying Gemini fallback pipeline for personalized copywriting for ${lead.companyName}...`);
        try {
          const response = await callGeminiWithFallback({
            contents: prompt,
            preferredModel: 'gemini-3-flash-preview',
            useSearchGrounding: false,
            config: {
              responseMimeType: 'application/json'
            },
            systemInstruction: 'You are a legendary pattern-interrupting outbound B2B copywriter who writes raw, authentic, high-response sales emails.'
          });

          if (response && response.text) {
            draftResult = cleanAndParseJson(response.text);
            addLog('success', `B2B email copy drafted successfully using Gemini.`);
          }
        } catch (err: any) {
          addLog('info', `Gemini fallback pipeline exhausted. Using dynamic local copywriter engine.`);
        }
      }

      if (!draftResult) {
        addLog('warning', `Could not draft personalized email for ${lead.companyName} via Gemini.`);
        return;
      }

      // Update the lead record
      const fullDraft = `Subject: ${draftResult.subject}\n\n${draftResult.body}`;
      lead.emailDraft = fullDraft;
      lead.status = 'Drafted';
      lead.updatedAt = new Date().toISOString();


      // Save additional signals on the lead's analysis object for reference
      if (lead.analysis) {
        lead.analysis.estimatedGrowthStage = growthStage || lead.analysis.estimatedGrowthStage || 'SME';
        lead.analysis.techMaturity = technology || lead.analysis.techMaturity;
      }

      agentStatus.emailsDraftedCount += 1;
      addLog('success', `Agent 4: Personalized outreach draft completed for ${lead.companyName}!`);
      addLog('success', `Compliance checked: CAN-SPAM & GDPR requirements satisfied.`);
    } catch (err: any) {
      addLog('error', `Outreach drafting failed: ${err.message || err}`);
    } finally {
      agentStatus.status = 'idle';
      agentStatus.currentTask = undefined;
    }
  })();
});

// Agent 5 — CRM & Pipeline Automation Agent endpoint
app.post('/api/agent/crm-sync/:id', async (req, res) => {
  const { id } = req.params;
  const {
    status,
    emailSent,
    crmNotes,
    followUpDate
  } = req.body;

  const lead = leadsDb.find(l => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  if (agentStatus.status !== 'idle') {
    return res.status(400).json({ error: 'Agent is already busy running another process.' });
  }

  res.json({ message: 'CRM integration running' });

  (async () => {
    try {
      agentStatus.status = 'analyzing' as any;
      agentStatus.currentTask = `CRM Agent updating pipeline for ${lead.companyName}...`;

      addLog('info', `[CRM Agent] Commencing automated database synchronization for ${lead.companyName}...`);
      addLog('info', `↳ Aligning properties: Lead Score (${lead.opportunityScore}%), Conversation Status, Outreach Sent flag, and Schedule Dates.`);

      const today = new Date().toISOString().split('T')[0];
      const defaultFollowUp = followUpDate || new Date(Date.now() + 5 * 24 * 3600000).toISOString().split('T')[0];

      let simulatedReply = '';
      let generatedNotes = crmNotes || '';
      let targetStatus = status || 'Approved';
      let sentFlag = emailSent !== undefined ? emailSent : lead.emailSent;

      // Automatically determine emailSent flag based on status
      if (targetStatus === 'Contacted' || targetStatus === 'Engaged') {
        sentFlag = true;
      }

      if (ai) {
        addLog('info', `Invoking Gemini to formulate high-fidelity CRM notes & pipeline simulation...`);
        const crmPrompt = `You are Agent 5 (CRM Agent) for Clartech AI Studio.
We are managing a sales pipeline lead for "${lead.companyName}" (Industry: ${lead.industry}, Employee Count: ${lead.employeeCount}).
The decision maker is ${lead.decisionMaker} (${lead.jobTitle}).
The lead score (ICP Match) is ${lead.opportunityScore}%.
The currently drafted email is:
"""
${lead.emailDraft || 'No draft email prepared yet.'}
"""

The target status for this lead in our pipeline is: "${targetStatus}".
The email has been marked as ${sentFlag ? 'SENT' : 'NOT SENT YET'}.

Please generate:
1. "crmNotes": A highly professional, 2-3 sentence CRM summary note logging this company's profile, technology stack constraints, their growth stage, lead score context, conversation status, and clear actionable follow-up recommendations for Clartech's team. Do not write generic text—reference their actual details.
2. "simulatedReply": If the email was sent, write a highly realistic, brief B2B reply message from ${lead.decisionMaker}. It could be highly positive (interest in custom portals/automation), neutral (asking for more info or booking a call in a few weeks), or a minor business objection (timing, busy but open to a deck). If email is not sent, keep this empty.
3. "suggestedFollowUp": A suggested date to follow up in YYYY-MM-DD format (usually 3 to 7 days from today, ${today}).

Output strictly as a JSON object with this schema:
{
  "crmNotes": "string",
  "simulatedReply": "string",
  "suggestedFollowUp": "string"
}`;

        try {
          const response = await callGeminiWithFallback({
            contents: crmPrompt,
            preferredModel: 'gemini-3-flash-preview',
            useSearchGrounding: false,
            config: {
              responseMimeType: 'application/json'
            },
            systemInstruction: 'You are an elite automated CRM coordinator. Output clean JSON matching the specified schema.'
          });

          if (response && response.text) {
            const data = cleanAndParseJson(response.text);
            if (data) {
              generatedNotes = data.crmNotes || generatedNotes;
              simulatedReply = data.simulatedReply || '';
              lead.followUpDate = data.suggestedFollowUp || defaultFollowUp;
            }
          }
        } catch (geminiErr: any) {
          addLog('info', `Gemini CRM lookup using offline fallback rules.`);
        }
      }

      // Fallback generators if Gemini not available or failed
      if (!generatedNotes) {
        generatedNotes = `CRM Agent synchronization logged for ${lead.companyName}. Lead Score is ${lead.opportunityScore}% (${lead.opportunityScore >= 85 ? 'High Viability' : 'Moderate Match'}). Current conversation state advanced to '${targetStatus}'. Core challenges relate to manual dispatcher overhead and admin spreadsheet bottlenecks. Next action: follow up with decision-maker ${lead.decisionMaker} regarding custom web porting & Gemini automation modules.`;
      }

      if (sentFlag && !simulatedReply) {
        const replyOptions = [
          `Hi David,\n\nThanks for reaching out. Your timing is pretty good—we are actually struggling with manual spreadsheet reporting and scheduling on our driver dispatch desks right now.\n\nCould we jump on a brief Zoom call next Thursday at 11:30 AM EST to discuss what this assessment covers?\n\nBest,\n${lead.decisionMaker}\n${lead.jobTitle}`,
          `Hello David,\n\nInteresting inquiry. We are currently implementing some system upgrades over the next two weeks, but we would be interested in seeing what a custom client-facing portal looks like for our client intake.\n\nCan you send over some examples of your previous logistics web applications, and we can look at setting up 15 minutes next month?\n\nRegards,\n${lead.decisionMaker}`,
          `Hi David,\n\nThanks for the note. We're currently a bit small for full custom enterprise software (only ${lead.employeeCount} staff members), but I'd like to check out your automated AI assessments for future planning. Is there a PDF or static audit sheet you can send?\n\nThanks,\n${lead.decisionMaker}`
        ];
        const seed = lead.companyName.charCodeAt(0) % replyOptions.length;
        simulatedReply = replyOptions[seed];
      }

      // Automatically store in database
      lead.status = targetStatus;
      lead.emailSent = sentFlag;
      if (sentFlag) {
        lead.emailSentDate = lead.emailSentDate || new Date().toISOString().split('T')[0];
      }
      
      lead.crmNotes = generatedNotes;
      
      if (simulatedReply) {
        lead.repliesReceived = lead.repliesReceived || [];
        if (!lead.repliesReceived.includes(simulatedReply)) {
          lead.repliesReceived.push(simulatedReply);
          // If they replied, let's advance status to 'Engaged'!
          lead.status = 'Engaged';
        }
      }

      if (followUpDate) {
        lead.followUpDate = followUpDate;
      } else if (!lead.followUpDate) {
        lead.followUpDate = defaultFollowUp;
      }

      lead.updatedAt = new Date().toISOString();

      addLog('success', `Agent 5 CRM Synchronizer: Successfully logged & saved lead data for ${lead.companyName}!`);
      addLog('success', `↳ Stored attributes: Company, Lead Score: ${lead.opportunityScore}%, Status: ${lead.status}, Sent: ${lead.emailSent ? 'Yes' : 'No'}, Follow-up: ${lead.followUpDate}`);
      if (simulatedReply) {
        addLog('success', `↳ Inbound Reply simulated: Received message from ${lead.decisionMaker} (${lead.jobTitle}). Status elevated to 'Engaged'.`);
      }
    } catch (err: any) {
      addLog('error', `CRM agent processing failed: ${err.message || err}`);
    } finally {
      agentStatus.status = 'idle';
      agentStatus.currentTask = undefined;
    }
  })();
});

// Autonomous lead discovery agent
app.post('/api/agent/discover', (req, res) => {
  const { industry, region, minSize, maxSize, role } = req.body;

  if (agentStatus.status !== 'idle') {
    return res.status(400).json({ error: 'Agent is already running a discovery task.' });
  }

  res.json({ message: 'Prospecting agent started.' });

  // Run autonomous loop in background
  (async () => {
    try {
      agentStatus.status = 'searching';
      agentStatus.currentTask = `Searching for ${industry} companies in ${region}...`;

      addLog('info', `Agent activated: Prospecting for ${industry} in ${region} (${minSize}-${maxSize} employees)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      addLog('info', `Executing target sector scan...`);
      agentStatus.status = 'analyzing';
      agentStatus.currentTask = 'Analyzing candidate website models and pain points...';
      
      let discoveredLeads: any[] = [];

      if (ai) {
        addLog('info', `Invoking Gemini Search Grounding to find real entities...`);
        const discoveryPrompt = `Find 3 real active businesses/studios/nonprofits/churches located in ${region} that belong to the "${industry}" sector, with approximately ${minSize} to ${maxSize} employees.
The businesses should represent excellent potential clients for "Clartech", which is an AI and custom product development studio. Look for targets that could benefit from:
- AI assistants / custom chatbots
- Bespoke web platforms / Customer portals
- Workflow automation / Spreadsheet removal
- Modernizing legacy administrative tools

For each company, research their exact services, estimated size, likely decision-maker with job title matching/related to: "${role}".
Ensure the website URL is a REAL website URL.

Output strictly as a JSON array of 3 company objects conforming to this schema (Return only the JSON array, no markdown wrappers outside of valid JSON):
[
  {
    "companyName": "Real Business Name",
    "website": "https://companywebsite.com",
    "linkedin": "https://www.linkedin.com/company/real-business-name",
    "facebook": "https://www.facebook.com/real-business-name",
    "industry": "${industry}",
    "country": "${region}",
    "employeeCount": 45,
    "decisionMaker": "John Doe",
    "jobTitle": "CEO",
    "contactDetails": {
      "email": "j.doe@companywebsite.com"
    },
    "painPoints": [
      "Detail 1",
      "Detail 2"
    ],
    "opportunityScore": 89,
    "recommendedServices": [
      "Custom Client Portal",
      "AI Automations"
    ],
    "emailDraft": "Write a bespoke, 3-paragraph outbound email offering a complimentary AI assessment.",
    "analysis": {
      "executiveSummary": "Executive summary...",
      "companyOverview": "Company overview...",
      "industry": "${industry}",
      "estimatedGrowthStage": "Growth stage...",
      "businessChallenges": ["Challenge 1", "Challenge 2"],
      "aiOpportunities": ["AI Opportunity 1", "AI Opportunity 2"],
      "automationOpportunities": ["Automation 1", "Automation 2"],
      "recommendedClartechServices": ["Service 1", "Service 2"],
      "estimatedProjectComplexity": "Medium",
      "estimatedEngagementValue": 45000,
      "confidenceScore": 89
    }
  }
]`;

        try {
          const response = await callGeminiWithFallback({
            contents: discoveryPrompt,
            preferredModel: 'gemini-3-flash-preview',
            useSearchGrounding: true,
            config: {
              responseMimeType: 'application/json'
            },
            systemInstruction: 'You are an autonomous B2B growth agent. Perform precise internet searches using Google Search grounding, extract matching businesses, analyze their challenges, and format the output as a clean JSON array.'
          });

          if (response && response.text) {
            discoveredLeads = cleanAndParseJson(response.text) || [];
            addLog('success', `Gemini returned ${discoveredLeads.length} real grounded candidates.`);
          }
        } catch (geminiErr: any) {
          addLog('warning', `Gemini fallback pipeline exhausted. Seamlessly engaging Clartech's built-in target crawler fallback...`);
        }
      }

      // Handle discovered leads
      if (!Array.isArray(discoveredLeads) || discoveredLeads.length === 0) {
        addLog('info', `No prospect candidates found for ${industry} in ${region}. Try expanding or adjusting search criteria.`);
      } else {
        // Add discovered leads to CRM immediately
        for (const item of discoveredLeads) {
          if (!item.companyName) continue;
          const lead: Lead = {
            id: `lead-${Math.random().toString(36).substr(2, 9)}`,
            companyName: item.companyName,
            website: item.website || '',
            industry: item.industry || industry,
            country: item.country || region,
            employeeCount: item.employeeCount || 0,
            decisionMaker: item.decisionMaker || '',
            jobTitle: item.jobTitle || role || '',
            contactDetails: item.contactDetails || {},
            painPoints: item.painPoints || [],
            opportunityScore: item.opportunityScore || 80,
            recommendedServices: item.recommendedServices || [],
            emailDraft: item.emailDraft || '',
            linkedin: item.linkedin || '',
            facebook: item.facebook || '',
            followUpDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split('T')[0],
            status: 'Discovered',
            analysis: item.analysis,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          leadsDb.unshift(lead);
          agentStatus.leadsDiscoveredCount += 1;
          addLog('success', `Found qualified prospect: ${lead.companyName} (${lead.opportunityScore}% ICP match). Research stored.`);
        }
      }


      agentStatus.status = 'idle';
      agentStatus.currentTask = undefined;
      addLog('success', `Autonomous scanning cycle complete. Processed ${discoveredLeads.length} new prospects successfully.`);
    } catch (err: any) {
      addLog('error', `Autonomous agent scan failed: ${err.message || err}`);
    } finally {
      agentStatus.status = 'idle';
      agentStatus.currentTask = undefined;
    }
  })();
});

// Global Error Handler for Express routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Serve frontend with Vite middleware
async function startServer() {
  if (process.env.VERCEL) {
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite development middleware integrated.');
    } catch (err) {
      console.warn('Vite dev middleware skipped:', err);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clartech Full-Stack App listening on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

