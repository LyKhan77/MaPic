import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import Sidebar from '../components/Sidebar'
import ImageCanvas from '../components/ImageCanvas'
import PromptInput from '../components/PromptInput'
import type { Generation } from '../types'
import { Toaster, toast } from 'sonner' // Need to install sonner for nice toasts

interface DashboardProps {
  session: Session
}

export default function Dashboard({ session }: DashboardProps) {
  const queryClient = useQueryClient()
  const [currentGen, setCurrentGen] = useState<Generation | null>(null)

  // Fetch History
  const { data: history = [] } = useQuery({
    queryKey: ['history', session.user.id],
    queryFn: () => api.getHistory(session.user.id),
  })

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: ({ prompt, model }: { prompt: string; model: string }) => api.generateImage(prompt, session.user.id, model),
    onMutate: () => {
      setCurrentGen(null) // Clear current image to show loading state
    },
    onSuccess: (newGen) => {
      queryClient.setQueryData(['history', session.user.id], (old: Generation[] = []) => [newGen, ...old])
      setCurrentGen(newGen)
      toast.success('Image generated successfully!')
    },
    onError: (error) => {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate image')
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteHistory(id),
    onSuccess: (_, id) => {
      // Optimistic update: remove item from history list
      queryClient.setQueryData(['history', session.user.id], (old: Generation[] = []) => 
        old.filter(item => item.id !== id)
      )
      
      // If deleted item is currently selected, clear selection
      if (currentGen?.id === id) {
        setCurrentGen(null)
      }
      
      toast.success('Deleted successfully')
    },
    onError: () => toast.error('Failed to delete item')
  })

  const handleSelectHistory = (gen: Generation) => {
    setCurrentGen(gen)
  }

  const handleNewChat = () => {
    setCurrentGen(null)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      <Toaster position="top-right" theme="dark" />
      
      <Sidebar 
        session={session} 
        history={history} 
        onSelect={handleSelectHistory} 
        onNewChat={handleNewChat}
        onDelete={(id) => deleteMutation.mutate(id)}
        currentId={currentGen?.id}
      />
      
      <main className="flex flex-1 flex-col relative">
        <div className="flex-1 relative">
           <ImageCanvas 
             currentGeneration={currentGen} 
             isLoading={generateMutation.isPending} 
             onGenerate={(prompt, model) => generateMutation.mutate({ prompt, model })}
           />
        </div>
        
        {currentGen && (
          <PromptInput 
            onGenerate={(prompt, model) => generateMutation.mutate({ prompt, model })} 
            isLoading={generateMutation.isPending} 
            isCentralized={false}
          />
        )}
      </main>
    </div>
  )
}
