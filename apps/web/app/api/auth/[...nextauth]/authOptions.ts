import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_URL } from "@/config";



export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "you@example.com",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required");
				}

				try {
					const res = await fetch(`${API_URL}/api/v1/user/signin`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email: credentials.email,
							password: credentials.password,
						}),
					});

					const data = await res.json();

					if (!res.ok) {
						if (data.requiresVerification) {
							throw new Error("Please verify your email first");
						}
						throw new Error(data.error || "Invalid credentials");
					}

					return {
						id: data.user.id.toString(),
						cuid: data.user.cuid,
						email: data.user.email,
						name: data.user.name,
						accessToken: data.token,
					};
				} catch (error) {
					if (error instanceof Error) {
						throw error;
					}
					throw new Error("Authentication failed");
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.cuid = user.cuid as string;
				token.accessToken = user.accessToken;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.cuid = token.cuid as string;
				session.accessToken = token.accessToken as string;
			}
			return session;
		},
		async redirect({ url, baseUrl }) {
			return baseUrl + "/dashboard";
		},
	},

	session: {
		strategy: "jwt",
		maxAge: 24 * 60 * 60, // 24 hours in seconds
	},
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
				maxAge: 24 * 60 * 60, // 24 hours - persists across browser restarts
			},
		},
	},
	pages: {
		signIn: "/signin",
	},
	secret:process.env.NEXTAUTH_SECRET
};

