import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  BookmarkCheck,
  CheckSquare,
  User,
  Bot,
  Compass,
} from 'lucide-react';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const DashboardLayout: React.FC = () => {
  const sidebarLinks = [
    { to: '/dashboard', label: 'Readiness Overview', icon: LayoutDashboard, end: true },
    { to: '/vault', label: 'Document Vault', icon: FileCheck2 },
    { to: '/saved', label: 'Saved Schemes', icon: BookmarkCheck },
    { to: '/tasks', label: 'Application Tasks', icon: CheckSquare },
    { to: '/profile', label: 'Applicant Profile', icon: User },
    { to: '/assistant', label: 'Scheme Assistant', icon: Bot },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  ना
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Citizen Profile</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant="eligible" size="sm">
                      Profile Active
                    </Badge>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {sidebarLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        )
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  to="/schemes"
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Discover More Schemes</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Area */}
          <main className="md:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
