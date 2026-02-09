import { LogOut, Plus, User, Trash2, Sun, Moon, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Generation } from '../types'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

interface SidebarProps {
  session: Session
  history: Generation[]
  onSelect: (gen: Generation) => void
  onNewChat: () => void
  onDelete: (id: string) => void
  currentId?: string
}

export default function Sidebar({ session, history, onSelect, onNewChat, onDelete, currentId }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setIsCollapsed(true)
        }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <motion.div 
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex h-full flex-col border-r border-border bg-card/40 backdrop-blur-md transition-colors z-20"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-border">
        <button 
          onClick={onNewChat}
          className={cn(
            "group flex items-center justify-center gap-2 rounded-lg bg-primary/10 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]",
            isCollapsed ? "h-12 w-full p-0" : "w-full px-4 py-3"
          )}
          title="New Generation"
        >
          <Plus size={isCollapsed ? 20 : 16} className={cn("transition-transform group-hover:rotate-90")} />
          {!isCollapsed && <span>NEW GENERATION</span>}
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {!isCollapsed && (
          <div className="px-2 py-2 text-xs font-mono text-muted-foreground uppercase tracking-widest opacity-70">
            History
          </div>
        )}
        
        {history.length === 0 ? (
            <div className={cn("p-4 text-center text-xs text-muted-foreground italic", isCollapsed && "hidden")}>
                No history yet.
            </div>
        ) : (
            history.map((item, i) => (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "group/item relative flex items-center rounded-md transition-all hover:bg-muted cursor-pointer",
                  currentId === item.id ? "bg-muted border-l-2 border-primary" : "border-l-2 border-transparent",
                  isCollapsed ? "justify-center p-3" : "justify-between p-3 w-full"
                )}
                onClick={() => onSelect(item)}
                title={isCollapsed ? item.prompt : undefined}
            >
                {isCollapsed ? (
                   <MessageSquare size={18} className={cn(currentId === item.id ? "text-primary" : "text-muted-foreground")} />
                ) : (
                  <>
                    <div className="flex-1 overflow-hidden text-left">
                        <span className="line-clamp-2 text-sm font-medium text-foreground block">
                        {item.prompt}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground block mt-1">
                        {new Date(item.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this item?')) onDelete(item.id)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1.5 rounded-full hover:bg-destructive/20 text-destructive transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
            </motion.div>
            ))
        )}
      </div>

      {/* User Footer */}
      <div className="border-t border-border p-4 bg-muted/20">
        <div className={cn("flex items-center gap-2", isCollapsed ? "flex-col" : "flex-row")}>
          <div className="flex h-10 w-10 items-center justify-center shrink-0 overflow-hidden">
             <img 
               src="/bearPic.png" 
               alt="User Profile" 
               className="h-full w-full object-contain"
             />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">
                {session.user.email?.split('@')[0]}
              </p>
              <p className="truncate text-[10px] text-muted-foreground font-mono">
                PRO ACCOUNT
              </p>
            </div>
          )}
          
          <div className={cn("flex gap-1", isCollapsed ? "flex-col mt-2" : "flex-row")}>
            <button 
              onClick={handleLogout}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

