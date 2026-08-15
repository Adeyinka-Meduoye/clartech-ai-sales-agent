import React, { useState } from 'react';
import { X, Building2, Globe, Users, Briefcase, Plus, CheckCircle2 } from 'lucide-react';
import { Lead } from '../types';

interface CreateLeadModalProps {
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

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

const REGIONS = [
  'USA', 'Canada', 'Mexico', 
  'United Kingdom', 'Germany', 'France', 'Netherlands', 'Ireland', 
  'Italy', 'Spain', 'Switzerland', 'Sweden', 'Norway', 
  'Denmark', 'Belgium', 'Austria', 'Poland', 'Portugal'
];

export default function CreateLeadModal({ onClose, onSave }: CreateLeadModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [country, setCountry] = useState(REGIONS[0]);
  const [employeeCount, setEmployeeCount] = useState<number>(25);
  const [decisionMaker, setDecisionMaker] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [successSaved, setSuccessSaved] = useState(false);
  const [savedCompanyName, setSavedCompanyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !website) return;

    onSave({
      companyName,
      website: website.startsWith('http') ? website : `https://${website}`,
      industry,
      country,
      employeeCount,
      decisionMaker,
      jobTitle,
      contactDetails: {
        email: email || undefined,
        phone: phone || undefined
      },
      painPoints: [],
      opportunityScore: 70, // manual score baseline
      recommendedServices: [],
      emailDraft: '',
      followUpDate: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split('T')[0], // 5 days follow-up
      status: 'Discovered'
    });
    setSavedCompanyName(companyName);
    setSuccessSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="create-modal-container">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl p-4 sm:p-6 overflow-hidden">
        {successSaved ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">Prospect Successfully Added!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                <strong className="text-slate-200">{savedCompanyName}</strong> has been successfully filed to your CRM Pipeline and is ready for AI analysis and outreach orchestration.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition cursor-pointer shadow-lg shadow-brand-500/20"
              >
                Done & View Pipeline
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 mb-4 sm:mb-5 shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-500 shrink-0" />
                <h3 className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">Add New Prospect</h3>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="TechCorp Solutions"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">Website URL *</label>
                  <input
                    type="text"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://techcorp.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">Employee Count</label>
                  <input
                    type="number"
                    min="1"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Contact Details (Decision Maker)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={decisionMaker}
                      onChange={(e) => setDecisionMaker(e.target.value)}
                      placeholder="E.g. Marcus Aurelius"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="E.g. COO, Founder"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-mono">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E.g. leader@company.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-mono">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="E.g. +1 (555) 012-3456"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!companyName || !website}
                  className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>File Prospect</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
