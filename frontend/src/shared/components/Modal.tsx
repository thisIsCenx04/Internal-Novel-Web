import { type ReactNode } from 'react'

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content">
        <header>
          <h2>{title}</h2>
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
