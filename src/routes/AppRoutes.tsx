import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AuthPage } from '@/pages/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { SchemesExplorePage } from '@/pages/SchemesExplorePage';
import { SchemeDetailPage } from '@/pages/SchemeDetailPage';
import { EligibilityResultsPage } from '@/pages/EligibilityResultsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DocumentVaultPage } from '@/pages/DocumentVaultPage';
import { SavedSchemesPage } from '@/pages/SavedSchemesPage';
import { TasksPage } from '@/pages/TasksPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AssistantPage } from '@/pages/AssistantPage';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Citizen Dashboard Routes (Dedicated Sidebar Layout) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vault" element={<DocumentVaultPage />} />
        <Route path="/checklist" element={<DocumentVaultPage />} />
        <Route path="/saved" element={<SavedSchemesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tracker" element={<TasksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Public & General Workflow Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/schemes" element={<SchemesExplorePage />} />
        <Route path="/schemes/:slug" element={<SchemeDetailPage />} />
        <Route path="/eligibility-results" element={<EligibilityResultsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
