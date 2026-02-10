import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
  icon?: string
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function FilterDropdown({ label, options, value, onChange, placeholder = 'Select...' }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-white/70 mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg text-white hover:border-samurai-red/50 transition-all"
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span className="font-medium">{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-samurai-grey-darker border-2 border-samurai-red/30 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-samurai-grey transition-colors ${
                value === option.value ? 'bg-samurai-red/20 text-samurai-red' : 'text-white/90'
              }`}
            >
              <span className="flex items-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span className="font-medium">{option.label}</span>
              </span>
              {value === option.value && <Check className="w-4 h-4 text-samurai-red" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
