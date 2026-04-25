"use client"

import { Badge } from "@/components/ui/badge"
import { RecyclingEntry } from "@/types"

interface RecentEntriesProps {
  entries: RecyclingEntry[]
}

const MATERIAL_BADGES: Record<string, string> = {
  plastic: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  glass: "bg-teal-100 text-teal-700 hover:bg-teal-100",
  paper: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  metal: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  electronics: "bg-orange-100 text-orange-700 hover:bg-orange-100",
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recycling entries yet. Start logging your recycling to see them here!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.slice(0, 10).map((entry, index) => (
        <div
          key={entry._id || index}
          className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-4">
            <Badge className={MATERIAL_BADGES[entry.material] || ""}>
              {entry.material.charAt(0).toUpperCase() + entry.material.slice(1)}
            </Badge>
            <div>
              <p className="font-medium">{entry.weight} kg</p>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary">+{entry.points} pts</p>
          </div>
        </div>
      ))}
    </div>
  )
}
