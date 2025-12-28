import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function SectionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex items-center p-4 gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32 flex-1" />
            <Skeleton className="h-8 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

