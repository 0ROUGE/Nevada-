export function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 w-full">
      <div className="h-8 w-48 bg-black/5 rounded-lg animate-pulse mb-6 mx-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/5 p-6 animate-pulse">
      <div className="w-full h-36 bg-black/5 rounded-xl mb-4" />
      <div className="h-4 w-20 bg-black/5 rounded-full mb-3" />
      <div className="h-5 w-3/4 bg-black/10 rounded mb-2" />
      <div className="h-3 w-full bg-black/5 rounded mb-1" />
      <div className="h-3 w-2/3 bg-black/5 rounded" />
    </div>
  )
}

export default PageSkeleton
