import PlaceholderPage from "@/components/Dashboard/PlaceholderPage";

export default function CreateChatbot() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Create Chatbot</h1>
      <PlaceholderPage params={{ slug: 'Create Chatbot Wizard' }} />
    </div>
  );
}
