import PlaceholderPage from "@/components/Dashboard/PlaceholderPage";

export default function Billing() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Billing</h1>
      <PlaceholderPage params={{ slug: 'Subscription & Invoices' }} />
    </div>
  );
}
