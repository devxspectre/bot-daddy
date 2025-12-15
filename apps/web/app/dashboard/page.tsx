"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApi } from "@/context/ApiContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  MessageSquare,
  Bot,
  Zap,
  HardDrive,
  Plus,
  Trash2,
  Pencil,
  Clipboard,
  Check
} from "lucide-react";
import EditChatbotModal from "@/components/Dashboard/EditChatbotModal";
import { APP_URL, API_URL } from "@/config";

interface Chatbot {
  id: number;
  public_id: string;
  name: string;
  cuid: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { getChatbots, getUserStats, deleteChatbot } = useApi();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [stats, setStats] = useState({ usedMB: "0.00" });
  const [loading, setLoading] = useState(true);
  const [editingChatbotId, setEditingChatbotId] = useState<string | null>(null);
  
  // New state for active chatbot and copy feedback
  const [activeChatbot, setActiveChatbot] = useState<Chatbot | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && session?.user?.cuid) {
        Promise.all([
            fetchChatbots(),
            fetchStats(session.user.cuid)
        ]).finally(() => setLoading(false));
    }
  }, [status, session]);

  const fetchChatbots = async () => {
    try {
        const bots = await getChatbots();
        setChatbots(bots);
        // Set first bot as active by default if none selected
        if (bots.length > 0 && !activeChatbot) {
            setActiveChatbot(bots[0]);
        }
    } catch (err) {
      console.error("Failed to fetch chatbots");
    }
  };

  const fetchStats = async (userId: string) => {
      try {
          const data = await getUserStats(userId);
          if (data?.storage) {
              setStats({ usedMB: data.storage.usedMB });
          }
      } catch (err) {
          console.error("Failed to fetch stats");
      }
  }

  const copyEmbedCode = () => {
    if (!activeChatbot || !session?.user?.cuid) return;

    const code = `<script src="${APP_URL}/bot-daddy.js"></script>
<script>
  window.BotDaddy.init({
    chatbotId: "${activeChatbot.public_id}",
    userId: "${session.user.cuid}",
    apiUrl: "${API_URL}"
  });
</script>`;

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 pb-20">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">  Welcome back, {session?.user?.name || "User"}!</h2>
       
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push("/dashboard/create")}>
            <Plus className="mr-2 h-4 w-4" /> Create Chatbot
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatbots.length}</div>
            <p className="text-xs text-muted-foreground">
              Active instances
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usedMB} MB</div>
            <p className="text-xs text-muted-foreground">
              Total storage used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usage Credits
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Free Tier</div>
            <p className="text-xs text-muted-foreground">
              Unlimited interactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {chatbots.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <Bot className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No chatbots created yet.</p>
                        <Button variant="link" onClick={() => router.push("/dashboard/create")}>Create your first bot &rarr;</Button>
                    </div>
                ) : (
                    chatbots.slice(0, 5).map(bot => (
                        <div 
                            key={bot.id} 
                            className={`flex items-center group p-3 rounded-lg transition-colors cursor-pointer border ${activeChatbot?.id === bot.id ? 'bg-primary/5 border-primary/20' : 'hover:bg-accent border-transparent'}`}
                            onClick={() => setActiveChatbot(bot)}
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-primary/10">
                              <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">{bot.name}</p>
                              <p className="text-sm text-muted-foreground">
                                  Created on {new Date(bot.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-auto flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity h-8 w-8 text-muted-foreground "
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingChatbotId(bot.public_id);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm("Are you sure you want to delete this chatbot? This action cannot be undone.")) {
                                            try {
                                                await deleteChatbot(bot.public_id);
                                                setChatbots(prev => prev.filter(b => b.id !== bot.id));
                                                // If deleted bot was active, reset active bot
                                                if (activeChatbot?.id === bot.id) {
                                                    setActiveChatbot(null);
                                                }
                                            } catch (err) {
                                                console.error("Failed to delete chatbot", err);
                                                alert("Failed to delete chatbot");
                                            }
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </CardContent>
        </Card>
        
        {/* Embed Code Column */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Embed Chatbot</CardTitle>
          </CardHeader>
          <CardContent>
            {activeChatbot ? (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Add this code to your website&apos;s <code>&lt;body&gt;</code> to install <strong>{activeChatbot.name}</strong>.
                    </p>
                    <div className="relative">
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono border">
{`<script src="${APP_URL}/bot-daddy.js"></script>
<script>
  window.BotDaddy.init({
    chatbotId: "${activeChatbot.public_id}",
    userId: "${session?.user?.cuid}",
    apiUrl: "${API_URL}"
  });
</script>`}
                        </pre>
                        <Button 
                            className="absolute top-2 right-2 h-8 w-8" 
                            size="icon" 
                            variant="secondary"
                            onClick={copyEmbedCode}
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${activeChatbot.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        Status: <span className="capitalize">{activeChatbot.status}</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
                    <Bot className="h-10 w-10 mb-2 opacity-20" />
                    <p>Select a chatbot to view embed code</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditChatbotModal 
        isOpen={!!editingChatbotId}
        chatbotId={editingChatbotId}
        onClose={() => setEditingChatbotId(null)}
        onSuccess={() => {
            fetchChatbots();
            if (session?.user?.cuid) fetchStats(session.user.cuid);
        }}
      />
    </div>
  );
}
