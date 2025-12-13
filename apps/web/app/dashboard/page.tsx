"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Navbar } from "@/components/Landing/Navbar";

export default function Dashboard() {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="http://localhost:3000/bot-daddy.js"></script>
<script>
  window.BotDaddy.init({
    apiUrl: 'http://localhost:3001',
    title: 'Sales Assistant',
    greeting: 'Hi! How can I help you today?'
  });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Embed Code Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Embed Your Chatbot</h2>
            <p className="text-muted-foreground mb-4">
              Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag.
            </p>
            
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground border border-border">
                {embedCode}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Configuration Placeholder */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Chatbot Preview</h2>
            <div className="prose text-muted-foreground">
              <p>
                Your chatbot is ready to go! Once embedded, it will appear on your site and use your AI configuration to answer customer queries.
              </p>
              <div className="mt-4 p-4 bg-accent/20 rounded-lg border border-accent/50 text-sm">
                <strong>Note:</strong> Ensure your backend API (localhost:3001) is running and accessible to the user's browser.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
