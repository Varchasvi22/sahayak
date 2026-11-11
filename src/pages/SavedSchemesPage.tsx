import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedSchemesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="info">My Bookmarks</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Schemes</h1>
        <p className="text-xs text-slate-600 mt-1">
          Review welfare initiatives you have bookmarked for application preparation.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No Saved Schemes Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you find schemes relevant to you in the Scheme Explorer, click "Save Scheme" to bookmark them here.
          </p>
          <div className="pt-2">
            <Link to="/schemes">
              <Button variant="primary" size="sm">
                Explore Schemes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Saved schemes persistence with Supabase user session will be wired in <strong>Phase 4</strong>.
      </div>
    </div>
  );
};
