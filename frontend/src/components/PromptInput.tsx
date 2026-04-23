import { useState, type KeyboardEvent, useRef, useEffect } from 'react'
import { Send, Settings2, Paperclip, X } from 'lucide-react'

interface PromptInputProps {
  onGenerate: (prompt: string, model: string, images?: string[]) => void
  isLoading: boolean
  isCentralized?: boolean
  onTyping?: (isTyping: boolean) => void
  initialPrompt?: string
  initialImageUrl?: string
}

const MODELS = [
  { id: 'x/flux2-klein:4b', name: 'Flux2 Klein (4B Original)' },
  { id: 'x/flux2-klein:4b-fp8', name: 'Flux2 Klein (4B fp8)' },
]

export default function PromptInput({ onGenerate, isLoading, isCentralized, onTyping, initialPrompt, initialImageUrl }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [showSettings, setShowSettings] = useState(false)
  const [images, setImages] = useState<{ id: string; base64: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt)
    } else {
      setPrompt('')
    }
    
    if (initialImageUrl) {
      const fetchImage = async () => {
        try {
          const res = await fetch(initialImageUrl)
          const blob = await res.blob()
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
          })
          setImages([{ id: 'rev-' + Math.random().toString(36).substring(7), base64 }])
        } catch (error) {
          console.error("Failed to load reference image", error)
        }
      }
      fetchImage()
    } else {
      setImages([])
    }
  }, [initialPrompt, initialImageUrl])

  const handleChange = (val: string) => {
    setPrompt(val)
    if (onTyping) {
        onTyping(val.length > 0)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (images.length + files.length > 3) {
      alert('You can only upload up to 3 images.')
      return
    }

    const newImages = [...images]
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 2MB.`)
        continue
      }
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
      })
      
      newImages.push({ id: Math.random().toString(36).substring(7), base64 })
    }
    
    setImages(newImages)
    
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
  }

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id))
  }

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return
    
    const cleanImages = images.length > 0 
      ? images.map(img => img.base64.includes(',') ? img.base64.split(',')[1] : img.base64) 
      : undefined;
      
    onGenerate(prompt, selectedModel, cleanImages)
    setPrompt('')
    setImages([])
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

        {/* Thumbnails Preview */}
        {images.length > 0 && (
          <div className={`flex gap-2 px-2 ${isCentralized ? 'justify-center' : ''}`}>
            {images.map(img => (
              <div key={img.id} className="relative w-16 h-16 rounded-md overflow-hidden border border-border group bg-black/20">
                <img src={img.base64} alt="Reference" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={`relative flex items-center gap-2 transition-all ${isCentralized ? 'rounded-full bg-[#2a2a2a] p-1.5 shadow-xl ring-1 ring-white/5' : 'rounded-xl bg-muted/20 p-2 ring-1 ring-border focus-within:ring-primary/50'}`}>
          <input 
             type="file" 
             multiple 
             accept="image/*" 
             className="hidden" 
             ref={fileInputRef}
             onChange={handleFileChange}
          />
          <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isLoading || images.length >= 3}
             className={`flex shrink-0 items-center justify-center transition-all disabled:opacity-50 ${isCentralized ? 'h-10 w-10 rounded-full text-gray-400 hover:text-white hover:bg-white/10' : 'p-2 text-muted-foreground hover:text-foreground'}`}
             title="Attach image (Max 3, 2MB each)"
          >
             <Paperclip size={isCentralized ? 18 : 20} />
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onTyping && onTyping(false)}
            placeholder={isCentralized ? "How can MaPic help you today?" : `Describe your imagination...`}
            disabled={isLoading}
            className={`flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 ${isCentralized ? 'text-lg py-3 px-4' : ''}`}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className={`group shrink-0 flex items-center justify-center transition-all ${isCentralized ? 'h-10 w-10 rounded-full bg-white text-black hover:bg-primary disabled:bg-gray-600' : 'rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background hover:bg-primary hover:text-primary-foreground'}`}
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