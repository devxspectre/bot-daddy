"use client";

import React, { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/signin", "/signup", "/verify"];

function AuthGuard({ children }: { children: React.ReactNode }) {
	const { status } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (status === "unauthenticated") {
			const isPublicRoute = PUBLIC_ROUTES.some(
				(route) => pathname === route || pathname?.startsWith(`${route}/`)
			);

			if (!isPublicRoute) {
				router.push("/");
			}
		}
	}, [status, pathname, router]);

	return <>{children}</>;
}

export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SessionProvider>
			<AuthGuard>{children}</AuthGuard>
		</SessionProvider>
	);
}
