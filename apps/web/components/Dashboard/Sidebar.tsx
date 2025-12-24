"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PlusCircle, 
  Bot, 
  BarChart2, 
  Settings, 
  CreditCard, 
  LogOut,
  Files,
  ArrowLeft
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Bot },
  { name: "Knowledge Base", href: "/dashboard/knowledge", icon: Files },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col my-auto ml-4 gap-4 z-50 w-80">
      {/* Back to Home Button */}
      <div>
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="group gap-2 rounded-full bg-card/80 backdrop-blur border-border/50  hover:border-primary/50 shadow-sm transition-all duration-300"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </Button>
      </div>

      {/* Main Sidebar Card */}
      <div 
        className={cn(
          "relative flex flex-col h-[75vh] w-full rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10",
        )}
      >
        {/* Create Action Section */}
        <div className="flex h-28 shrink-0 items-center px-8 border-b border-border/40">
          <Link href="/dashboard/create" className="flex items-center gap-x-5 group w-full">
            <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 h-14 w-14">
              <PlusCircle className="h-7 w-7 stroke-[1.5]" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">Create New</span>
              <span className="text-sm text-muted-foreground">Deploy a new chatbot</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col px-6 py-8 overflow-hidden hover:overflow-y-auto custom-scrollbar">
          <ul role="list" className="flex flex-col gap-y-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      "group flex items-center gap-x-5 rounded-xl px-4 py-4 text-lg font-medium transition-all duration-200"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        "h-7 w-7 shrink-0 transition-all duration-200 stroke-[1.5]"
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate tracking-tight">
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Logout - Always at bottom */}
          <div className="mt-auto pt-8 border-t border-border/40">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="group flex w-full items-center gap-x-5 rounded-xl px-4 py-4 text-lg font-medium text-muted-foreground hover:bg-red-500/5 hover:text-red-600 transition-all duration-200"
              title="Log out"
            >
              <LogOut
                className="h-7 w-7 shrink-0 group-hover:text-red-600 transition-colors stroke-[1.5]"
                aria-hidden="true"
              />
              <span className="truncate">
                  Log out
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
