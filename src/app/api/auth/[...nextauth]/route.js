import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const passwordMatch =
          credentials.password === process.env.ADMIN_PASSWORD;

        console.log("Password match:", passwordMatch);

        if (credentials.email === process.env.ADMIN_EMAIL && passwordMatch) {
          return { email: credentials.email, name: "Admin" };
        }

        console.log("Authorization failed");
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user.email = token.email;
      session.user.name = token.name;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
