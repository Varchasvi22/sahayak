import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base">
                स
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                SAHAYAK
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              An AI-assisted government welfare discovery and application-readiness
              platform for citizens across all 28 Indian States and 8 Union Territories.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Aadhaar Privacy Policy</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schemes" className="hover:text-emerald-600 transition-colors">
                  Scheme Explorer
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-emerald-600 transition-colors">
                  Eligibility Questionnaire
                </Link>
              </li>
              <li>
                <Link to="/vault" className="hover:text-emerald-600 transition-colors">
                  Universal Document Vault
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">
                  Application Readiness Meter
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-emerald-600 transition-colors">
                  Grounded AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals Link Directory */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  <span>Ayushman Bharat (PM-JAY)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  <span>PM-Kisan Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Civic Tech Transparency Notice */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Public Notice & Integrity
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-2">
              Sahayak is an independent civic-tech readiness tool. It is not affiliated
              with or endorsed by the Government of India or State Governments.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              All applications must be submitted directly through official government
              portals or authorized Citizen Service Centres (CSC).
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span>© 2026 Sahayak Civic-Tech. Built for citizens across India.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="hover:text-slate-900">
              Architecture & Documentation
            </Link>
            <Link to="/admin" className="hover:text-slate-900">
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
