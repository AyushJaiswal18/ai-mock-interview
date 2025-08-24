export function UsersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter skeleton */}
      <div className="bg-white/5 rounded-lg p-6">
        <div className="flex flex-wrap gap-4">
          <div className="h-10 bg-white/10 rounded w-64 animate-pulse" />
          <div className="h-10 bg-white/10 rounded w-32 animate-pulse" />
          <div className="h-10 bg-white/10 rounded w-40 animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="h-6 bg-white/10 rounded w-48 animate-pulse" />
        </div>
        
        <div className="p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4 border-b border-white/5 last:border-b-0">
              <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-32 animate-pulse" />
                <div className="h-3 bg-white/10 rounded w-48 animate-pulse" />
              </div>
              <div className="h-6 bg-white/10 rounded w-20 animate-pulse" />
              <div className="h-6 bg-white/10 rounded w-16 animate-pulse" />
              <div className="h-8 bg-white/10 rounded w-24 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
