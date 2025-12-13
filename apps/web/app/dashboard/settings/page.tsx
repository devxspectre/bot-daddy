"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
  User,
  Lock,
  Bell,
  Key,
  LogOut,
  ShieldAlert,
  Save,
  Copy
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("pk_live_51M0...");
  const [isLoading, setIsLoading] = useState(false);

  // Mock saving
  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
             <Key className="h-4 w-4" /> API Access
          </TabsTrigger>
        </TabsList>

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
                     {/* Mock Toggles - Using Flex for now without Switch component */}
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

        {/* API Tab */}
        <TabsContent value="api">
             <Card>
                <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                        Manage keys for accessing the Bot Daddy API programmatically.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label>Public Key</Label>
                        <div className="flex gap-2">
                            <Input value={apiKey} readOnly className="font-mono bg-muted" />
                            <Button variant="outline" size="icon">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter className="justify-between">
                    <p className="text-sm text-muted-foreground">Last used: Never</p>
                    <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">Revoke Key</Button>
                </CardFooter>
             </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
