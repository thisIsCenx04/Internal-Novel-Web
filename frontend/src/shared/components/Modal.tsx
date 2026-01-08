import type { ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__header">
          {title ? <h3>{title}</h3> : null}
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
