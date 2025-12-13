import PlaceholderPage from "@/components/Dashboard/PlaceholderPage";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
      <PlaceholderPage params={{ slug: 'Usage & Insights' }} />
    </div>
  );
}
