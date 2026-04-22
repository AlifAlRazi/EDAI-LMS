import { Skeleton } from "@/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <div className="bg-dark-100 border border-white/5 rounded-2xl overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-dark-100 border border-white/5 rounded-2xl p-5 space-y-3">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function EnrollmentCardSkeleton() {
  return (
    <div className="bg-dark-100 border border-white/5 rounded-2xl p-5 flex gap-4">
      <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function QuizLoadingSkeleton() {
  return (
    <div className="max-w-3xl w-full space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="bg-dark-100 border border-white/5 rounded-2xl p-10 space-y-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-4/5" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-2.5">
      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
      <div className="space-y-1.5 max-w-[80%]">
        <Skeleton className="h-4 w-48 rounded-2xl" />
        <Skeleton className="h-4 w-64 rounded-2xl" />
        <Skeleton className="h-4 w-36 rounded-2xl" />
      </div>
    </div>
  );
}
