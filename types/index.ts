import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
    }
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    userId?: string
  }
}

export interface RecyclingEntry {
  _id?: string
  userId: string
  userEmail: string
  userName: string
  material: "plastic" | "glass" | "paper" | "metal" | "electronics"
  weight: number
  points: number
  date: Date
  createdAt: Date
}

export interface User {
  _id?: string
  email: string
  name: string
  image?: string
  password?: string
  provider?: string
  role: "user" | "admin"
  points: number
  createdAt: Date
}

export interface MaterialStats {
  material: string
  totalWeight: number
  totalPoints: number
  count: number
}

export interface LeaderboardEntry {
  userId: string
  name: string
  email: string
  totalPoints: number
  totalWeight: number
  rank: number
}
