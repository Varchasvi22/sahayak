import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Clock,
  Plus,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Apply for fresh Income Certificate (Tehsildar / e-District Portal)',
      scheme: 'Post Matric Scholarship for SC Students',
      stage: 'STAGE 1: DOCUMENT PREPARATION',
      due: '18 Nov 2026',
      completed: false,
      portalUrl: 'https://edistrict.up.gov.in',
    },
    {
      id: 2,
      title: 'Collect College Bonafide & Current Semester Fee Receipt',
      scheme: 'Post Matric Scholarship for SC Students',
      stage: 'STAGE 1: DOCUMENT PREPARATION',
      due: '20 Nov 2026',
      completed: true,
      portalUrl: null,
    },
    {
      id: 3,
      title: 'Verify Aadhaar-Bank Seeding via NPCI DBT Mapper',
      scheme: 'PM-Kisan Samman Nidhi',
      stage: 'STAGE 2: PORTAL REGISTRATION',
      due: '15 Nov 2026',
      completed: true,
      portalUrl: 'https://myaadhaar.uidai.gov.in',
    },
    {
      id: 4,
      title: 'Submit Online Application on National Scholarship Portal (NSP)',
      scheme: 'Post Matric Scholarship for SC Students',
      stage: 'STAGE 3: OFFICIAL SUBMISSION',
      due: '30 Nov 2026',
      completed: false,
      portalUrl: 'https://scholarships.gov.in',
    },
  ]);

  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackNumber, setAckNumber] = useState('NSP-2026-UP-884920');
  const [savedAck, setSavedAck] = useState<string | null>(null);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSaveAck = () => {
    if (ackNumber.trim()) {
      setSavedAck(ackNumber);
      setAckModalOpen(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="eligible">Application Preparation Engine</Badge>
            <span className="text-xs text-slate-500 font-medium">
              {completedCount} of {tasks.length} Milestones Achieved
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Application Task Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Follow structured stages from gathering certificates to portal submission and tracking your official acknowledgment number.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAckModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Application Ref ID
        </Button>
      </div>

      {/* 4-Stage Application Pipeline Visualizer */}
      <div className="bg-white border border-civic-border rounded-2xl p-6 shadow-subtle space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          The 4-Stage Submission Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              stage: '01',
              title: 'Document Prep',
              desc: 'Collect certificates (Income, Caste, Passbook)',
              active: false,
              done: true,
            },
            {
              stage: '02',
              title: 'Portal Registration',
              desc: 'Create login on state/central portal (NSP / MeeSeva)',
              active: true,
              done: false,
            },
            {
              stage: '03',
              title: 'Form Submission',
              desc: 'Upload papers and submit application before deadline',
              active: false,
              done: false,
            },
            {
              stage: '04',
              title: 'Disbursement & Ack',
              desc: 'Track reference ID and Direct Benefit Transfer (DBT)',
              active: false,
              done: false,
            },
          ].map((item) => (
            <div
              key={item.stage}
              className={`p-4 rounded-xl border transition-all ${
                item.active
                  ? 'bg-emerald-50/60 border-civic-emerald ring-2 ring-emerald-200'
                  : item.done
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                  STAGE {item.stage}
                </span>
                {item.done && <CheckCircle2 className="w-4 h-4 text-civic-emerald" />}
                {item.active && <Badge variant="eligible" size="sm">Current</Badge>}
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recorded Acknowledgment Card (if exists) */}
      {savedAck && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-civic-emerald" />
            <div>
              <span className="text-xs text-emerald-800 font-bold block">
                Saved Application Submission Acknowledgment
              </span>
              <span className="font-mono text-sm font-extrabold text-emerald-950">
                {savedAck}
              </span>
            </div>
          </div>
          <a
            href="https://scholarships.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-civic-emerald font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <span>Track on Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Active Scheme Preparation Milestones</h3>

        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`p-4 transition-all ${
              task.completed ? 'bg-slate-50/70 border-slate-200' : 'bg-white hover:border-civic-emerald/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald cursor-pointer"
                />
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {task.stage}
                  </div>
                  <h4
                    className={`text-sm font-semibold mt-0.5 ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-medium text-civic-emerald">{task.scheme}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" /> Due: {task.due}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-8 sm:pl-0">
                {task.portalUrl && (
                  <a
                    href={task.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3 h-3" />}>
                      Open Portal
                    </Button>
                  </a>
                )}
                <Badge variant={task.completed ? 'eligible' : 'unknown'} size="sm">
                  {task.completed ? 'Completed' : 'Pending'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Record Acknowledgment Modal */}
      {ackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader>
              <CardTitle>Record Application Reference ID</CardTitle>
              <CardDescription>
                Once you submit on an official portal (e.g. NSP, PM-Kisan, Seva Sindhu), paste your acknowledgment number here for safe record-keeping.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Application Reference Number"
                placeholder="e.g. NSP-2026-UP-884920"
                value={ackNumber}
                onChange={(e) => setAckNumber(e.target.value)}
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setAckModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveAck}>
                  Save Reference ID
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
