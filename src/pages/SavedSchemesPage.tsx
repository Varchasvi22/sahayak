import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookmarkCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SchemeCard } from '@/features/schemes/components/SchemeCard';
import { getSchemes, getSchemeCategories, SchemeRow, CategoryRow } from '@/services/schemeService';
import { getSavedSchemeIds, toggleSchemeBookmark } from '@/services/savedSchemeService';
import { useAuth } from '@/contexts/AuthContext';

export const SavedSchemesPage: React.FC = () => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [allSchemes, setAllSchemes] = useState<SchemeRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ids, schemesRes, catRes] = await Promise.all([
        getSavedSchemeIds(user?.id),
        getSchemes(),
        getSchemeCategories(),
      ]);
      setSavedIds(ids);
      setAllSchemes(schemesRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (err) {
      console.error('Error loading saved schemes page:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSavedChanged = (e: any) => {
      if (e.detail?.allIds) {
        setSavedIds(e.detail.allIds);
      }
    };
    window.addEventListener('sahayak:saved_schemes_changed', handleSavedChanged);
    return () => {
      window.removeEventListener('sahayak:saved_schemes_changed', handleSavedChanged);
    };
  }, [user]);

  const handleToggleSave = async (schemeId: string) => {
    const { isSaved } = await toggleSchemeBookmark(schemeId, user?.id);
    setSavedIds((prev) =>
      isSaved ? [...prev, schemeId] : prev.filter((id) => id !== schemeId)
    );
  };

  const categoryMap = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  const bookmarkedSchemes = allSchemes.filter((s) => savedIds.includes(s.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">My Bookmarks</Badge>
            <span className="text-xs text-slate-500 font-medium">
              {user ? 'Cloud Synced' : 'Local Browser Session'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Schemes</h1>
          <p className="text-xs text-slate-600 mt-1">
            Review welfare initiatives you have bookmarked for application preparation and document readiness.
          </p>
        </div>

        <Link to="/schemes">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore More Schemes
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-civic-emerald" />
          <p className="text-xs text-slate-500">Loading saved bookmarks...</p>
        </div>
      ) : bookmarkedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              isSaved={true}
              onToggleSave={handleToggleSave}
              categoryName={categoryMap[scheme.category_id]}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">No Saved Schemes Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When you discover schemes in the directory, click the bookmark icon on any card to pin them here for easy tracking.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/schemes">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Verified Directory
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
