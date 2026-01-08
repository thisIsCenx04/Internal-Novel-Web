type ToastProps = {
  message: string
  variant?: 'info' | 'error'
}

export function Toast({ message, variant = 'info' }: ToastProps) {
  return <div className={`toast toast--${variant}`}>{message}</div>
}
