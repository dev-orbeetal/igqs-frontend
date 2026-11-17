export default function StaffLoading() {
  return (
    <div className="grid gap-3" aria-busy="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-24 animate-pulse rounded-2xl bg-white dark:bg-white/5" />
      ))}
    </div>
  );
}
