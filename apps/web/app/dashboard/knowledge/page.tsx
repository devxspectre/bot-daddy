import PlaceholderPage from "@/components/Dashboard/PlaceholderPage";

export default function KnowledgeBase() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
      <PlaceholderPage params={{ slug: 'Document Management' }} />
    </div>
  );
}
