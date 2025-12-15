"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { API_URL } from "@/config";
import { ChatbotDocument } from "@/context/ApiContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Upload, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";



export default function KnowledgeBase() {
  const { data: session } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<ChatbotDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.cuid) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/file/documents?userId=${session?.user?.cuid}`, {
        headers: {
            Authorization: `Bearer ${session?.accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !session?.user?.cuid) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", session.user.cuid);

    try {
      const res = await fetch(`${API_URL}/api/v1/file/upload`, {
        method: "POST",
        body: formData,
        // Content-Type header matches automatically with FormData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      // Success
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/file/${encodeURIComponent(filename)}?userId=${session?.user?.cuid}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
        console.error("Delete failed", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Manage the documents your chatbots use as their knowledge source.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>Add a new PDF to your knowledge base.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            {selectedFile ? (
                                <div className="text-sm font-medium text-primary break-all">
                                    {selectedFile.name}
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm font-medium">Click to upload</span>
                                    <span className="text-xs text-muted-foreground mt-1">PDF only (max 5MB)</span>
                                </>
                            )}
                        </div>

                        {error && (
                            <p className="text-xs text-red-500 font-medium">{error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={!selectedFile || uploading}>
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload Document
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* Documents List */}
        <div className="md:col-span-2">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Existing Documents</CardTitle>
                    <CardDescription>
                        {documents.length} document{documents.length !== 1 ? 's' : ''} available.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div key={doc.filename} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/5 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate text-sm">{doc.filename}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.chunks} chunks
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                        onClick={() => handleDelete(doc.filename)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
