"use client";

import { useState, useEffect } from "react";
import { useApi, ChatbotDocument } from "@/context/ApiContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface EditChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    chatbotId: string | null; // Public ID
}

export default function EditChatbotModal({ isOpen, onClose, onSuccess, chatbotId }: EditChatbotModalProps) {
    const { getChatbotDetails, updateChatbot, getDocuments } = useApi();
    const { data: session } = useSession();
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#000000");
    const [documents, setDocuments] = useState<ChatbotDocument[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && chatbotId && session?.user?.cuid) {
            fetchData(chatbotId, session.user.cuid);
        } else {
            // Reset state when closed
            setName("");
            setColor("#000000");
            setSelectedFiles([]);
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, chatbotId, session]);

    const fetchData = async (id: string, userId: string) => {
        setLoading(true);
        setError(null);
        try {
            // Fetch chatbot details and user's documents in parallel
            const [detailsData, docsData] = await Promise.all([
                getChatbotDetails(id),
                getDocuments(userId)
            ]);

            const bot = detailsData.chatbot;
            setName(bot.name);
            setColor(bot.color);
            // linked files come as array of filenames
            setSelectedFiles(bot.files || []);
            setDocuments(docsData);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Failed to fetch data:", err);
            setError(err.message || "Failed to load chatbot data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatbotId) return;

        setSubmitting(true);
        setError(null);

        try {
            await updateChatbot(chatbotId, {
                name,
                color,
                files: selectedFiles
            });
            onSuccess();
            onClose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || "Failed to update chatbot");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleFile = (filename: string) => {
        setSelectedFiles(prev => 
            prev.includes(filename) 
                ? prev.filter(f => f !== filename)
                : [...prev, filename]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Chatbot</DialogTitle>
                    <DialogDescription>
                        Update your chatbot&apos;s settings and knowledge base.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[450px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                    id="name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="My Awesome Chatbot"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color">Theme Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        id="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input 
                                        type="text" 
                                        value={color} 
                                        onChange={(e) => setColor(e.target.value)}
                                        className="flex-1"
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Knowledge Base</Label>
                                <p className="text-xs text-muted-foreground">Select documents this chatbot should use for context.</p>
                                <div className="border rounded-md p-2">
                                    <ScrollArea className="h-[150px]">
                                        {documents.length === 0 ? (
                                            <p className="text-sm text-center text-muted-foreground py-4">No documents uploaded.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {documents.map((doc) => (
                                                    <div key={doc.filename} className="flex items-center space-x-2 p-1 hover:bg-accent rounded-sm">
                                                        <Checkbox 
                                                            id={`doc-${doc.filename}`} 
                                                            checked={selectedFiles.includes(doc.filename)}
                                                            onCheckedChange={() => toggleFile(doc.filename)}
                                                        />
                                                        <Label 
                                                            htmlFor={`doc-${doc.filename}`}
                                                            className="flex-1 text-sm font-normal cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
                                                        >
                                                            {doc.filename}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
