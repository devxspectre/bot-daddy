"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { API_URL } from "@/config";

import { useRouter, usePathname } from "next/navigation";

interface Chatbot {
    id: number;
    public_id: string;
    name: string;
    color: string;
    status: string;
    created_at: string;
    files?: string[];
}



export interface ChatbotDocument {
    filename: string;
    chunks: number;
    uploaded_at: string;
    size?: number;
}

interface UserStats {
    storage: {
        totalBytes: number;
        usedMB: string;
    };
}

interface AnalyticsSummary {
    totalConversations: number;
}

interface DailyStats {
    date: string;
    count: number;
}

interface SessionLog {
    session_id: string;
    started_at: string;
    ended_at: string | null;
    message_count: number;
    chatbot_name: string;
    chatbot_public_id: string;
    duration_seconds: number;
}

interface ApiContextType {
    // Chatbot operations
    getChatbots: () => Promise<Chatbot[]>;
    createChatbot: (data: { name: string; color?: string; files?: string[] }) => Promise<{ success: boolean; chatbot: Chatbot }>;
    
    // Document operations
    getDocuments: (userId: string) => Promise<ChatbotDocument[]>;
    uploadFile: (file: File, userId: string) => Promise<{ success: boolean; documentId: number }>;
    deleteDocument: (filename: string, userId: string) => Promise<{ success: boolean }>;
    
    // User Stats
    getUserStats: (userId: string) => Promise<UserStats>;
    
    deleteChatbot: (publicId: string) => Promise<{ success: boolean }>;
    getChatbotDetails: (publicId: string) => Promise<{ success: boolean; chatbot: Chatbot }>;
    updateChatbot: (publicId: string, data: { name: string; color: string; files: string[] }) => Promise<{ success: boolean; chatbot: Chatbot }>;
    
    // Analytics
    getAnalyticsSummary: () => Promise<AnalyticsSummary>;
    getDailyConversations: (days?: number) => Promise<DailyStats[]>;
    getSessionLogs: (limit?: number) => Promise<SessionLog[]>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        if (status === "unauthenticated" && pathname?.startsWith("/dashboard")) {
            router.push("/");
        }
    }, [status, pathname, router]);
    
    const getHeaders = () => {
        return {
            Authorization: `Bearer ${session?.accessToken}`,
        };
    };

    const getChatbots = async () => {
        if (!session?.accessToken) return [];
        const res = await fetch(`${API_URL}/api/v1/chatbot`, {
            headers: getHeaders(),
        });
        const data = await res.json();
        return data.chatbots || [];
    };

    const createChatbot = async (payload: { name: string; color?: string; files?: string[] }) => {
        const res = await fetch(`${API_URL}/api/v1/chatbot`, {
            method: "POST",
            headers: {
                ...getHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to create chatbot");
        }
        return res.json();
    };

    const deleteChatbot = async (publicId: string) => {
        const res = await fetch(`${API_URL}/api/v1/chatbot/${publicId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete chatbot");
        }
        return res.json();
    };

    const getDocuments = async (userId: string) => {
        const res = await fetch(`${API_URL}/api/v1/file/documents?userId=${userId}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch documents");
        const data = await res.json();
        return data.documents || [];
    };

    const uploadFile = async (file: File, userId: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        const res = await fetch(`${API_URL}/api/v1/file/upload`, {
            method: "POST",
            body: formData,
            // Header for auth is implicitly handled or needs explicit handling depending on CORS/options
            // Note: FormData handling in fetch usually sets content-type multipart/form-data boundary automatically.
        });
        
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
    };

    const deleteDocument = async (filename: string, userId: string) => {
        const res = await fetch(`${API_URL}/api/v1/file/${filename}?userId=${userId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Delete failed");
        return res.json();
    };

    const getUserStats = async (userId: string) => {
        const res = await fetch(`${API_URL}/api/v1/user/stats?userId=${userId}`, {
            headers: getHeaders(),
        });
        if (!res.ok) return { storage: { totalBytes: 0, usedMB: "0.00" } };
        return res.json();
    };

    const getChatbotDetails = async (publicId: string) => {
        const res = await fetch(`${API_URL}/api/v1/chatbot/${publicId}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch chatbot details");
        return res.json();
    };

    const updateChatbot = async (publicId: string, payload: { name: string; color: string; files: string[] }) => {
        const res = await fetch(`${API_URL}/api/v1/chatbot/${publicId}`, {
            method: "PUT",
            headers: {
                ...getHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to update chatbot");
        }
        return res.json();
    };

    const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
        const res = await fetch(`${API_URL}/api/v1/analytics/summary`, {
            headers: getHeaders(),
        });
        if (!res.ok) return { totalConversations: 0 };
        return res.json();
    };

    const getDailyConversations = async (days: number = 30): Promise<DailyStats[]> => {
        const res = await fetch(`${API_URL}/api/v1/analytics/daily?days=${days}`, {
            headers: getHeaders(),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.stats || [];
    };

    const getSessionLogs = async (limit: number = 50): Promise<SessionLog[]> => {
        const res = await fetch(`${API_URL}/api/v1/analytics/sessions?limit=${limit}`, {
            headers: getHeaders(),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.sessions || [];
    };

    return (
        <ApiContext.Provider
            value={{
                getChatbots,
                createChatbot,
                getDocuments,
                uploadFile,
                deleteDocument,
                getUserStats,
                deleteChatbot,
                getChatbotDetails,
                updateChatbot,
                getAnalyticsSummary,
                getDailyConversations,
                getSessionLogs
            }}
        >
            {children}
        </ApiContext.Provider>
    );
}

export function useApi() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error("useApi must be used within an ApiProvider");
    }
    return context;
}
