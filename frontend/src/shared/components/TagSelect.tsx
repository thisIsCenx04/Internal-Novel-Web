import { useEffect, useRef, useState } from 'react'

type TagOption = {
  id: string
  name: string
}

type TagSelectProps = {
  options: TagOption[]
  value: string[]
  onChange: (next: string[]) => void
}

export function TagSelect({ options, value, onChange }: TagSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id))
      return
    }
    onChange([...value, id])
  }

  const selectedLabels = options.filter((option) => value.includes(option.id))

  return (
    <div className="tag-select tag-select--dropdown" ref={containerRef}>
      <button type="button" className="tag-select__trigger" onClick={() => setOpen(!open)}>
        {selectedLabels.length ? `${selectedLabels.length} selected` : 'Select categories'}
        <span className="tag-select__caret">{open ? '▲' : '▼'}</span>
      </button>
      {selectedLabels.length ? (
        <div className="tag-select__chips">
          {selectedLabels.map((option) => (
            <span key={option.id} className="tag-chip tag-chip--active">
              {option.name}
            </span>
          ))}
        </div>
      ) : null}
      {open ? (
        <div className="tag-select__menu">
          {options.map((option) => {
            const active = value.includes(option.id)
            return (
              <label key={option.id} className="tag-select__option">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(option.id)}
                />
                <span>{option.name}</span>
              </label>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
