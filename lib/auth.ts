import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getDatabase } from "./mongodb"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const db = await getDatabase()
        const user = await db.collection("users").findOne({
          email: credentials.email as string,
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const db = await getDatabase()
        const existingUser = await db.collection("users").findOne({
          email: user.email,
        })

        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: "google",
            role: "user",
            points: 0,
            createdAt: new Date(),
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const db = await getDatabase()
        const dbUser = await db.collection("users").findOne({
          email: user.email,
        })
        token.role = dbUser?.role || "user"
        token.userId = dbUser?._id.toString()
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.userId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
