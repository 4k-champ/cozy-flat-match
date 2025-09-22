import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FlatCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const FlatCardSkeleton = ({ viewMode = 'grid' }: FlatCardSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-6">
            <Skeleton className="w-48 h-32 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-3 md:p-4 space-y-3">
        <div>
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};