export function ErrorDisplay() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-destructive text-lg">Failed to load dashboard data</div>
    </div>
  );
}
