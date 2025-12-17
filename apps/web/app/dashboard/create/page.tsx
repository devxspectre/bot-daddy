"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApi, ChatbotDocument } from "@/context/ApiContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, FileText, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";



export default function CreateChatbot() {
  const router = useRouter();
  const { data: session } = useSession();
  const { getDocuments, uploadFile, createChatbot } = useApi();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    color: "#1677FF", // Default Blue
    files: [] as string[]
  });

  // Docs State
  const [documents, setDocuments] = useState<ChatbotDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  
  // Upload State
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session?.user?.cuid) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
        if (!session?.user?.cuid) return;
        const docs = await getDocuments(session.user.cuid);
        setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
        setDocsLoading(false);
    }
  };

  const handleFileToggle = (filename: string) => {
    setFormData(prev => {
        const files = prev.files.includes(filename)
            ? prev.files.filter(f => f !== filename)
            : [...prev.files, filename];
        return { ...prev, files };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }
      
      // Auto-upload
      if (!session?.user?.cuid) return;
      setUploading(true);
      setError("");

      try {
        await uploadFile(file, session.user.cuid);
        
        // Success
        await fetchDocuments();
        // Auto-select the uploaded file
        setFormData(prev => ({
            ...prev,
            files: [...prev.files, file.name]
        }));
      } catch (err) {
        setError("Failed to upload file");
      } finally {
        setUploading(false);
        // Reset input
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate mandatory docs
    if (formData.files.length === 0) {
        setError("Please select at least one document for your knowledge base.");
        setLoading(false);
        return;
    }

    try {
      await createChatbot(formData);

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Chatbot</h1>
        <p className="text-muted-foreground">
          Configure your chatbot&apos;s identity and knowledge base.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Configuration */}
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Identity Card */}
            <Card>
                <CardHeader>
                <CardTitle>Identity</CardTitle>
                <CardDescription>
                    Basic appearance settings.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Bot Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Support Bot"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Brand Color</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {[
                            { name: "Blue", value: "#1677FF" },
                            { name: "Purple", value: "#722ED1" },
                            { name: "Cyan", value: "#13C2C2" },
                            { name: "Green", value: "#52C41A" },
                            { name: "Magenta", value: "#EB2F96" },
                            { name: "Red", value: "#F5222D" },
                            { name: "Orange", value: "#FA8C16" },
                            { name: "Yellow", value: "#FADB14" },
                            { name: "Volcano", value: "#FA541C" },
                            { name: "Geekblue", value: "#2F54EB" },
                            { name: "Lime", value: "#A0D911" },
                            { name: "Black", value: "#000000" },
                            ].map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                className={cn(
                                "group relative flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                                formData.color === preset.value 
                                    ? 'border-primary ring-1 ring-primary bg-primary/5' 
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                )}
                                onClick={() => setFormData({ ...formData, color: preset.value })}
                            >
                                <div 
                                className="w-6 h-6 rounded-full shrink-0 border border-black/10 shadow-sm" 
                                style={{ backgroundColor: preset.value }} 
                                />
                                <span className="text-xs font-medium truncate">{preset.name}</span>
                            </button>
                            ))}
                        </div>
                        
                        {/* Custom Color Input */}
                        <div className="flex items-center gap-3 pt-2">
                            <div className="relative w-10 h-10 rounded-lg border overflow-hidden shadow-sm" style={{ backgroundColor: formData.color }}>
                                <Input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
                                />
                            </div>
                             <Input 
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="font-mono uppercase w-32"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Knowledge Sources Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle>Knowledge Sources</CardTitle>
                        <CardDescription>Select documents this chatbot should learn from.</CardDescription>
                    </div>
                     <div>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm"
                            disabled={uploading}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                            Upload New
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {docsLoading ? (
                        <div className="py-8 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                            No documents found. Upload one to get started.
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            <div className="space-y-2">
                                {documents.map((doc) => {
                                    const isSelected = formData.files.includes(doc.filename);
                                    return (
                                        <div 
                                            key={doc.filename}
                                            className={cn(
                                                "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                                                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
                                            )}
                                            onClick={() => handleFileToggle(doc.filename)}
                                        >
                                            <div className={cn(
                                                "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                            )}>
                                                {isSelected && <Check className="h-3.5 w-3.5" />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium truncate">{doc.filename}</p>
                                                <p className="text-xs text-muted-foreground">{doc.chunks} chunks • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    )}
                    <p className={cn("text-xs text-right mt-2 transition-colors", 
                        formData.files.length === 0 ? "text-red-500 font-medium" : "text-muted-foreground"
                    )}>
                        {formData.files.length} selected {formData.files.length === 0 && "(Required)"}
                    </p>
                </CardContent>
            </Card>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm p-4 border-t lg:static lg:bg-transparent lg:p-0 lg:border-0 rounded-lg">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" size="lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Chatbot
                </Button>
            </div>
        </form>
        
        {/* Right Column: Visual Preview */}
        <div className="lg:sticky lg:top-6 hidden lg:block">
            <Card className="h-full border-muted bg-muted/10">
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                        How your bot will look to users.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[500px]">
                    <div className="border rounded-lg shadow-xl w-full max-w-sm bg-white dark:bg-zinc-950 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4" style={{ backgroundColor: formData.color }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M12 22a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2a2 2 0 0 1 2 2z"/><path d="M22 12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2z"/><path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><rect x="7" y="7" width="10" height="10" rx="3"/></svg>
                                </div>
                                <div>
                                    <span className="text-white font-medium text-sm block leading-tight">{formData.name || "Chatbot Name"}</span>
                                    <span className="text-white/60 text-[10px] block leading-tight">Online</span>
                                </div>
                            </div>
                            <span className="text-white/80 cursor-pointer hover:bg-white/10 p-1 rounded-md transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </span>
                        </div>
                        
                        {/* Chat Area */}
                        <div className="h-96 bg-zinc-50 dark:bg-zinc-900 p-4 flex flex-col space-y-4 overflow-y-auto">
                            <div className="flex justify-center my-2">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-black/5 px-2 py-0.5 rounded-full">Today</span>
                            </div>
                            
                            {/* Bot Message */}
                            <div className="flex gap-2">
                                <div className="self-end pb-1">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: formData.color }}>AI</div>
                                </div>
                                <div className="bg-white dark:bg-zinc-800 border rounded-2xl rounded-bl-none p-3 text-sm max-w-[85%] shadow-sm">
                                    <p>Hello! I&apos;m {formData.name || "your assistant"}. I can answer questions based on {formData.files.length > 0 ? `${formData.files.length} connected documents` : "my knowledge base"}.</p>
                                </div>
                            </div>

                            {/* User Message */}
                             <div className="self-end text-white rounded-2xl rounded-br-none p-3 text-sm max-w-[85%] shadow-sm ml-auto" style={{ backgroundColor: formData.color }}>
                                <p>How does this work?</p>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t bg-white dark:bg-zinc-950">
                            <div className="relative">
                                <input disabled className="w-full bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none cursor-not-allowed placeholder:text-muted-foreground/50" placeholder="Type a message..." />
                                <div className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-primary text-white opacity-50">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </div>
                            </div>
                            <div className="text-[10px] text-center text-muted-foreground mt-2 opacity-50">Powered by BotDaddy</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
