import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalOnboarding } from '@/services/profileService';
import { fetchUserDocumentItems } from '@/services/userDocumentService';
import { getSavedSchemeIds, toggleSchemeBookmark } from '@/services/savedSchemeService';
import {
  getUserTasks,
  toggleTaskComplete,
  createTask,
  deleteTask,
  TaskRow,
  TaskInsert,
} from '@/services/taskService';
import {
  getApplicationTrackers,
  updateApplicationTrackerStatus,
  SchemeApplicationTrackerItem,
  ApplicationPreparationStatus,
} from '@/services/applicationTrackerService';
import {
  calculateProfileCompleteness,
  computeRecommendedSchemes,
} from '@/features/dashboard/dashboardUtils';
import { aggregateSchemeDocuments } from '@/features/documents/crossSchemeIntelligence';
import { UserDocumentItem } from '@/features/documents/types';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import { formatINR } from '@/lib/utils';
import { Card, CardHeader } from '@/components/ui/Card';
import {
  DashboardWelcomeHeader,
  ProfileCompletenessCard,
  ApplicationTrackerSection,
  PendingTasksCard,
  RecommendedSchemesSection,
  DashboardDocumentsOverview,
} from '@/features/dashboard';
import {
  TrendingUp,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const localDraft = getLocalOnboarding();

  const [isLoading, setIsLoading] = useState(true);
  const [userDocs, setUserDocs] = useState<UserDocumentItem[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [trackers, setTrackers] = useState<SchemeApplicationTrackerItem[]>([]);

  // Consolidate citizen profile data from Supabase Auth Profile or Local Onboarding Draft
  const citizen = useMemo(() => {
    return {
      fullName:
        profile?.full_name ||
        localDraft?.fullName ||
        user?.user_metadata?.full_name ||
        'Citizen Applicant',
      age: profile?.age ?? localDraft?.age ?? null,
      gender: profile?.gender || localDraft?.gender || null,
      state: profile?.state_of_residence || localDraft?.stateOfResidence || 'Uttar Pradesh',
      district: profile?.district || localDraft?.district || 'Varanasi',
      residenceArea: profile?.residence_area || localDraft?.residenceArea || 'RURAL',
      category: profile?.social_category || localDraft?.socialCategory || 'SC',
      education: profile?.education_level || localDraft?.educationLevel || 'GRADUATE',
      employmentStatus: profile?.employment_status || localDraft?.employmentStatus || 'STUDENT',
      isStudent: profile?.is_student ?? localDraft?.isStudent ?? true,
      annualIncome: profile?.annual_family_income ?? localDraft?.annualFamilyIncome ?? 180000,
      ownsAgriculturalLand: profile?.owns_agricultural_land ?? localDraft?.ownsAgriculturalLand ?? false,
      hasBplCard: profile?.has_bpl_card ?? localDraft?.hasBplCard ?? false,
      isDifferentlyAbled: profile?.is_differently_abled ?? localDraft?.isDifferentlyAbled ?? false,
      disabilityPercentage: profile?.disability_percentage ?? localDraft?.disabilityPercentage ?? null,
      hasUdidCard: (profile?.additional_attributes as any)?.has_udid_card ?? localDraft?.hasUdidCard ?? false,
    };
  }, [profile, localDraft, user]);

  // Load all dashboard datasets
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [docs, savedIds, taskRes, trackerItems] = await Promise.all([
        fetchUserDocumentItems(user?.id),
        getSavedSchemeIds(user?.id),
        getUserTasks(user?.id),
        getApplicationTrackers(user?.id),
      ]);

      setUserDocs(docs);
      setSavedSchemeIds(savedIds);
      setTasks(taskRes.data);
      setTrackers(trackerItems);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen to cross-module events
    const handleSavedChanged = (e: any) => {
      if (e.detail?.allIds) {
        setSavedSchemeIds(e.detail.allIds);
      }
    };
    const handleTasksChanged = (e: any) => {
      if (e.detail?.tasks) {
        setTasks(e.detail.tasks);
      }
    };
    const handleTrackersChanged = (e: any) => {
      if (e.detail?.items) {
        setTrackers(Object.values(e.detail.items));
      }
    };

    window.addEventListener('sahayak:saved_schemes_changed', handleSavedChanged);
    window.addEventListener('sahayak:tasks_changed', handleTasksChanged);
    window.addEventListener('sahayak:application_trackers_changed', handleTrackersChanged);

    return () => {
      window.removeEventListener('sahayak:saved_schemes_changed', handleSavedChanged);
      window.removeEventListener('sahayak:tasks_changed', handleTasksChanged);
      window.removeEventListener('sahayak:application_trackers_changed', handleTrackersChanged);
    };
  }, [user]);

  // Profile Completeness Result
  const completeness = useMemo(() => {
    return calculateProfileCompleteness(profile || localDraft || citizen);
  }, [profile, localDraft, citizen]);

  // Deterministically Computed Recommended Schemes
  const recommendedSchemes = useMemo(() => {
    return computeRecommendedSchemes(citizen, userDocs);
  }, [citizen, userDocs]);

  // Cross-Scheme Document Readiness Metrics across tracked & verified schemes
  const activeSchemesForDocs = useMemo(() => {
    if (savedSchemeIds.length > 0) {
      const saved = VERIFIED_SCHEMES.filter((s) => savedSchemeIds.includes(s.id));
      if (saved.length > 0) return saved;
    }
    return VERIFIED_SCHEMES.slice(0, 3);
  }, [savedSchemeIds]);

  const documentMetrics = useMemo(() => {
    const input = activeSchemesForDocs.map((s) => ({
      id: s.id,
      name: s.official_name,
      slug: s.slug,
      governmentLevel: s.government_level,
      required_document_keys: s.required_document_keys,
    }));
    return aggregateSchemeDocuments(input, userDocs);
  }, [activeSchemesForDocs, userDocs]);

  // High-Level Eligibility Summary Counts
  const potentiallyEligibleCount = recommendedSchemes.filter(
    (s) => s.matchStatus === 'POTENTIALLY_ELIGIBLE'
  ).length;

  const needsInfoCount = recommendedSchemes.filter(
    (s) => s.matchStatus === 'INSUFFICIENT_INFORMATION'
  ).length;

  const totalUnlockedValue = recommendedSchemes
    .filter((s) => s.matchStatus === 'POTENTIALLY_ELIGIBLE')
    .reduce((sum, s) => sum + s.financialBenefitAmount, 0);

  // Handlers
  const handleToggleSave = async (schemeId: string) => {
    const { isSaved } = await toggleSchemeBookmark(schemeId, user?.id);
    const updatedIds = isSaved
      ? [...savedSchemeIds, schemeId]
      : savedSchemeIds.filter((id) => id !== schemeId);
    setSavedSchemeIds(updatedIds);

    // Refresh trackers
    const updatedTrackers = await getApplicationTrackers(user?.id);
    setTrackers(updatedTrackers);
  };

  const handleStatusChangeTracker = async (
    schemeId: string,
    newStatus: ApplicationPreparationStatus,
    details?: { acknowledgmentNumber?: string; notes?: string }
  ) => {
    const updated = await updateApplicationTrackerStatus(
      schemeId,
      newStatus,
      details,
      user?.id
    );

    setTrackers((prev) =>
      prev.map((t) => (t.schemeId === schemeId ? updated : t))
    );
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    await toggleTaskComplete(taskId, isCompleted, user?.id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: isCompleted ? 'COMPLETED' : 'PENDING',
              completed_at: isCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );
  };

  const handleCreateTask = async (task: TaskInsert) => {
    const { data } = await createTask(task, user?.id);
    if (data) {
      setTasks((prev) => [data, ...prev]);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId, user?.id);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-3">
        <Loader2 className="w-9 h-9 animate-spin mx-auto text-civic-emerald" />
        <h3 className="text-sm font-bold text-slate-800">
          Loading Applicant Dashboard...
        </h3>
        <p className="text-xs text-slate-500">
          Fetching verified records, statutory rules, and document vault status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section & Profile Summary */}
      <DashboardWelcomeHeader
        citizenName={citizen.fullName}
        state={citizen.state}
        district={citizen.district}
        category={citizen.category}
        education={citizen.education}
        annualIncome={citizen.annualIncome}
        isCloudSynced={Boolean(user)}
      />

      {/* 2. Profile Completion Indicator */}
      <ProfileCompletenessCard completeness={completeness} />

      {/* 3. High-Level Summary Metrics Row (Eligibility & Document Readiness) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Potentially Eligible Schemes */}
        <Card className="border-l-4 border-l-civic-emerald shadow-2xs">
          <CardHeader className="p-5 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Statutory Eligibility
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {potentiallyEligibleCount}
              </span>
              <span className="text-xs font-semibold text-civic-emerald flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> Qualified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {needsInfoCount > 0
                ? `${needsInfoCount} scheme(s) need more info`
                : 'All rules evaluated'}
            </p>
          </CardHeader>
        </Card>

        {/* Financial Benefit Unlocked */}
        <Card className="border-l-4 border-l-blue-600 shadow-2xs">
          <CardHeader className="p-5 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Annual Benefit Value
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {totalUnlockedValue > 0 ? formatINR(totalUnlockedValue) : '₹0'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Direct Benefit Transfer + fee waivers
            </p>
          </CardHeader>
        </Card>

        {/* Application Readiness */}
        <Card className="border-l-4 border-l-teal-600 shadow-2xs">
          <CardHeader className="p-5 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Document Readiness
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {documentMetrics.completionPercentage}%
              </span>
              <span className="text-xs font-semibold text-teal-700 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {documentMetrics.completionPercentage >= 80 ? 'Ready' : 'In Progress'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden flex">
              <div
                className="bg-civic-emerald h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${documentMetrics.completionPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {documentMetrics.availableCount} of {documentMetrics.totalUniqueRequired} unique certificates ready
            </p>
          </CardHeader>
        </Card>

        {/* Pending Actions */}
        <Card className="border-l-4 border-l-amber-500 shadow-2xs">
          <CardHeader className="p-5 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Actions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700">
                {tasks.filter((t) => t.status !== 'COMPLETED').length}
              </span>
              <span className="text-xs font-semibold text-amber-600">Tasks</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {documentMetrics.missingCount + documentMetrics.expiredCount} documents pending
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* 4. Application Tracker: 7-Stage Scheme Preparation Progress */}
      <ApplicationTrackerSection
        trackers={trackers}
        onStatusChange={handleStatusChangeTracker}
      />

      {/* 5. Document Readiness Overview & Missing Document Summary */}
      <DashboardDocumentsOverview
        metrics={documentMetrics}
        schemesCount={activeSchemesForDocs.length}
      />

      {/* 6. Pending Tasks & Milestones Tracker */}
      <PendingTasksCard
        tasks={tasks}
        onToggleTask={handleToggleTask}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* 7. Recommended Schemes (Deterministically Evaluated) */}
      <RecommendedSchemesSection
        schemes={recommendedSchemes}
        savedSchemeIds={savedSchemeIds}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
};
