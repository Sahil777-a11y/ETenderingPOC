import * as React from "react"
import { cn } from "./button"

export const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-4">
    <div className="px-4 py-2 text-xs font-bold text-blue-200 uppercase tracking-wider">
      {title}
    </div>
    <div>{children}</div>
  </div>
)
