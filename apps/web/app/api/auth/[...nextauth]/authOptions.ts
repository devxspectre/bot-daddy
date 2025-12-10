import { NextAuthOptions } from "next-auth";
// import Google from "next-auth/providers/google";
import CredentialProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
	providers: [
		// For future use
		// Google({
		//     clientId: process.env.GOOGLE_CLIENT_ID??"enter_your_client_id",
		//     clientSecret: process.env.GOOGLE_CLIENT_SECRET??"enter_your_client_secret",
		// }),
		CredentialProvider({
			name: "Credentials",
			credentials: {
				username: {
					label: "Username",
					type: "email",
					placeholder: "jondoe@example.com",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, req) {					
					if(credentials?.username=='test@user.com'&&credentials?.password=='123456')
						return {id:'1234',email:credentials?.username}
					return null;
			
			},
			
		}),
	],
	callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
    }
    return token;
  },
  async session({ session, token }) {
    if (token && session.user) {
      session.user.id = token.id as string;
    }
    return session;
  },
  async redirect({ url, baseUrl }) {	
    return baseUrl;
  }
},

	session:{
		strategy:'jwt'
	},
	pages:{
		signIn:'/signin',
	}
};
