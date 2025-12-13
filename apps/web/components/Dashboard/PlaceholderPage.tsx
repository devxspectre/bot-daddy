export default function PlaceholderPage({ params }: { params: { slug?: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">Coming Soon</h1>
      <p className="text-xl text-muted-foreground max-w-lg">
        This feature is currently under development. Stay tuned for updates!
      </p>
      <div className="p-4 bg-muted rounded-lg border border-border mt-8">
        <code className="text-sm font-mono text-primary">Feature: {params?.slug || 'New Feature'}</code>
      </div>
    </div>
  );
}
