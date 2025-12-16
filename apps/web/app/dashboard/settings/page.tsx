"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Lock,
  Bell,
  Key,
  ShieldAlert,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";

interface ApiKey {
  id: number;
  keyPreview: string;
  plan: string;
  rateLimit: number;
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface NewApiKey extends ApiKey {
  key: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<NewApiKey | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [showFullKey, setShowFullKey] = useState(false);

  const getHeaders = () => ({
    Authorization: `Bearer ${session?.accessToken}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchApiKeys();
    }
  }, [session]);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/api-keys`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (err) {
      console.error("Failed to fetch API keys", err);
    } finally {
      setKeysLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/api-keys`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.apiKey);
        fetchApiKeys();
      }
    } catch (err) {
      console.error("Failed to create API key", err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/api-keys/${keyId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (res.ok) {
        fetchApiKeys();
      }
    } catch (err) {
      console.error("Failed to revoke API key", err);
    }
  };

  const copyToClipboard = (text: string, keyId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and API keys.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab - Now First */}
        <TabsContent value="api" className="space-y-4">
          {/* API Key Created Modal */}
          <Dialog open={!!newlyCreatedKey} onOpenChange={(open) => !open && setNewlyCreatedKey(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-500" />
                  API Key Created Successfully
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Copy this key now. You won't be able to see it again!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                    {showFullKey 
                      ? newlyCreatedKey?.key 
                      : newlyCreatedKey?.key.replace(/(.{12}).*/, "$1" + "•".repeat(32))}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFullKey(!showFullKey)}
                    className="shrink-0"
                  >
                    {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => newlyCreatedKey && copyToClipboard(newlyCreatedKey.key, newlyCreatedKey.id)}
                  >
                    {copiedKeyId === newlyCreatedKey?.id ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setNewlyCreatedKey(null);
                    setShowFullKey(false);
                  }}
                >
                  I've saved the key
                </Button>
              </div>
            </DialogContent>
          </Dialog>


          {/* Create New Key */}
          <Card>
            <CardHeader>
              <CardTitle>Create API Key</CardTitle>
              <CardDescription>
                Generate a new key for your chatbot integrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKey}>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Plus className="mr-2 h-4 w-4" />
                  Create New API Key
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                {apiKeys.filter(k => k.isActive).length} active key{apiKeys.filter(k => k.isActive).length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keysLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : apiKeys.filter(k => k.isActive).length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Key className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No API keys created yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.filter(k => k.isActive).map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card transition-colors group hover:bg-muted/5"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                          <Key className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">
                            {key.keyPreview}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(key.createdAt).toLocaleDateString()}
                            {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" defaultValue={session?.user?.name || ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={session?.user?.email || ""} disabled className="bg-muted" />
                <p className="text-[0.8rem] text-muted-foreground">
                    Email address cannot be changed.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5">
             <CardHeader>
                 <CardTitle className="text-red-600 flex items-center gap-2">
                     <ShieldAlert className="h-5 w-5" /> Danger Zone
                 </CardTitle>
                 <CardDescription className="text-red-600/80">
                     Irreversible actions. Proceed with caution.
                 </CardDescription>
             </CardHeader>
             <CardContent>
                 <Button variant="destructive">Delete Account</Button>
             </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                        Choose what you want to be notified about.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Communication emails</Label>
                            <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
                        </div>
                        <Button variant="outline" size="sm">Enabled</Button>
                     </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Marketing emails</Label>
                            <p className="text-sm text-muted-foreground">Receive emails about new products, features, and more.</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-muted-foreground">Disabled</Button>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
