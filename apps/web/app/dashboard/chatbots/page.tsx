import PlaceholderPage from "@/components/Dashboard/PlaceholderPage";

export default function MyChatbots() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">My Chatbots</h1>
      <PlaceholderPage params={{ slug: 'Chatbot Management' }} />
    </div>
  );
}
