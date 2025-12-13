"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Check, 
  Activity, 
  MessageSquare, 
  HardDrive, 
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { API_URL, APP_URL } from "@/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  
  // Use CUID for user identification in embed
  const userId = session?.user?.cuid || "";

  const embedCode = `<script src="${APP_URL}/bot-daddy.js"></script>
<script>
  window.BotDaddy.init({
    apiUrl: "${API_URL}",
    userId: "${userId}",
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            View Analytics
          </Button>
          <Button size="sm">
            Create Chatbot
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 MB</div>
            <p className="text-xs text-muted-foreground">
              +12 MB added this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Activity Table */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Real-time interactions with your deployed chatbots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Bot Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { status: "Active", bot: "Sales Assistant", source: "Website", time: "2m ago" },
                  { status: "Completed", bot: "Support Bot", source: "Help Center", time: "15m ago" },
                  { status: "Active", bot: "Sales Assistant", source: "Landing Page", time: "1h ago" },
                  { status: "Offline", bot: "Internal Tools", source: "Dashboard", time: "3h ago" },
                ].map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${item.status === 'Active' ? 'bg-green-500' : item.status === 'Completed' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        {item.status}
                      </div>
                    </TableCell>
                    <TableCell>{item.bot}</TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Embed Code & Quick Actions */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration</CardTitle>
              <CardDescription>
                Embed your chatbot in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!userId ? (
                 <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                   <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Please sign in to view your integration code.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                    <div className="relative group">
                        <pre className="bg-muted/50 p-4 rounded-lg text-xs font-mono text-foreground border border-border overflow-x-auto custom-scrollbar">
                            {embedCode}
                        </pre>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>API Status: <span className="text-green-500 font-medium">Operational</span></span>
                        <Button variant="link" size="sm" className="h-auto p-0 gap-1">
                            Read Documentation <ArrowUpRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                     <CardTitle className="text-base">System Health</CardTitle>
                     <MoreHorizontal className="h-4 w-4 text-muted-foreground cursor-pointer" />
                 </div>
             </CardHeader>
             <CardContent>
                 <div className="space-y-3">
                     <div className="flex items-center justify-between text-sm">
                         <span className="text-muted-foreground">Database Status</span>
                         <span className="flex items-center gap-1.5 text-green-500 font-medium text-xs">
                             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                             Connected
                         </span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                         <span className="text-muted-foreground">Vector Store</span>
                         <span className="flex items-center gap-1.5 text-green-500 font-medium text-xs">
                             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                             Ready
                         </span>
                     </div>
                 </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


