import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked } from 'lucide-react';

export default function BookmarksPage() {
  // This component is a placeholder for future implementation.
  // The logic to fetch and display bookmarked questions will be added later.
  
  return (
    <>
      <AppHeader title="Bookmarks" />
      <main className="flex-1">
        <div className="container py-8 px-4 md:px-6">
          <Card>
            <CardHeader>
              <CardTitle>My Bookmarked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
                <BookMarked className="h-16 w-16" />
                <p className="text-lg font-medium">No bookmarks yet!</p>
                <p>You can bookmark questions during a quiz to review them here later.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
