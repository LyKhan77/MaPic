import { useState, type KeyboardEvent } from 'react'
import { Send, Settings2 } from 'lucide-react'

interface PromptInputProps {
  onGenerate: (prompt: string, model: string) => void
  isLoading: boolean
  isCentralized?: boolean
  onTyping?: (isTyping: boolean) => void
}

const MODELS = [
  { id: 'x/flux2-klein:4b', name: 'Flux2 Klein (4B) - Image' },
  { id: 'x/z-image-turbo:fp8', name: 'Z-Image Turbo - Image' },
]

export default function PromptInput({ onGenerate, isLoading, isCentralized, onTyping }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [showSettings, setShowSettings] = useState(false)

  const handleChange = (val: string) => {
    setPrompt(val)
    if (onTyping) {
        onTyping(val.length > 0)
    }
  }

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return
    onGenerate(prompt, selectedModel)
    setPrompt('')
    if (onTyping) onTyping(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`w-full transition-all duration-500 ${isCentralized ? '' : 'border-t border-border bg-card/40 backdrop-blur-md p-6'}`}>
      <div className={`mx-auto w-full relative space-y-2 ${isCentralized ? 'max-w-2xl' : 'max-w-4xl'}`}>
        
        {/* Model Selector Toggle */}
        {!isCentralized && (
            <div className="flex items-center justify-between px-1">
                <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors uppercase"
                >
                    <Settings2 size={12} />
                    <span>Model: {MODELS.find(m => m.id === selectedModel)?.name}</span>
                </button>
                <span className="text-[10px] text-muted-foreground font-mono">ENTER to send</span>
            </div>
        )}

        {showSettings && !isCentralized && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-card rounded-lg border border-border mb-2 animate-in fade-in slide-in-from-bottom-2 shadow-lg">
            {MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id)
                  setShowSettings(false)
                }}
                className={`text-left text-xs p-2 rounded hover:bg-muted font-mono transition-colors ${selectedModel === model.id ? 'bg-primary/20 text-primary border border-primary/50' : 'text-muted-foreground'}`}
              >
                {model.name}
              </button>
            ))}
          </div>
        )}

        <div className={`relative flex items-center gap-2 transition-all ${isCentralized ? 'rounded-full bg-[#2a2a2a] p-1.5 shadow-xl ring-1 ring-white/5' : 'rounded-xl bg-muted/20 p-2 ring-1 ring-border focus-within:ring-primary/50'}`}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onTyping && onTyping(false)}
            placeholder={isCentralized ? "How can MaPic help you today?" : `Describe your imagination...`}
            disabled={isLoading}
            className={`flex-1 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 ${isCentralized ? 'text-lg py-3' : ''}`}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className={`group flex items-center justify-center transition-all ${isCentralized ? 'h-10 w-10 rounded-full bg-white text-black hover:bg-primary disabled:bg-gray-600' : 'rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background hover:bg-primary hover:text-primary-foreground'}`}
          >
            {isCentralized ? <Send size={18} /> : (
                <>
                    <span>GENERATE</span>
                    <Send size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                </>
            )}
          </button>
        </div>
        
        {isCentralized && (
            <div className="flex justify-center gap-4 mt-4">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/5"
                >
                    <Settings2 size={12} />
                    <span>Model: {MODELS.find(m => m.id === selectedModel)?.name.split(' (')[0]}</span>
                </button>
            </div>
        )}

        {showSettings && isCentralized && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#1a1a1a] rounded-2xl border border-white/5 mt-4 shadow-2xl animate-in zoom-in-95 duration-200">
                {MODELS.map(model => (
                <button
                    key={model.id}
                    onClick={() => {
                    setSelectedModel(model.id)
                    setShowSettings(false)
                    }}
                    className={`text-left text-xs p-3 rounded-xl hover:bg-white/5 font-mono transition-colors ${selectedModel === model.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-gray-400'}`}
                >
                    {model.name}
                </button>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}