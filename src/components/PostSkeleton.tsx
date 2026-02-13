import { cn } from '@/lib/utils';

interface PostSkeletonProps {
  isEdgeToEdge?: boolean;
}

export default function PostSkeleton({ isEdgeToEdge = false }: PostSkeletonProps) {
  return (
    <div className={cn(
      "bg-background mb-4 overflow-hidden",
      isEdgeToEdge ? "" : "border border-border rounded-lg"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-tertiary animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-tertiary rounded animate-pulse" />
            <div className="h-3 w-20 bg-tertiary rounded animate-pulse" />
          </div>
        </div>
        <div className="w-5 h-5 bg-tertiary rounded animate-pulse" />
      </div>

      {/* Media */}
      <div className="w-full bg-tertiary animate-pulse aspect-[4/5]" />

      {/* Actions */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-7 h-7 bg-tertiary rounded-full animate-pulse" />
            <div className="w-7 h-7 bg-tertiary rounded-full animate-pulse" />
            <div className="w-7 h-7 bg-tertiary rounded-full animate-pulse" />
            <div className="w-7 h-7 bg-tertiary rounded-full animate-pulse" />
          </div>
          <div className="w-7 h-7 bg-tertiary rounded-full animate-pulse" />
        </div>

        {/* Likes */}
        <div className="h-4 w-24 bg-tertiary rounded animate-pulse" />

        {/* Caption */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-tertiary rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-tertiary rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
