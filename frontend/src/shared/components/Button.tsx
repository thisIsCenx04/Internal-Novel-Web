import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  const className = ['btn', `btn--${variant}`, props.className]
    .filter(Boolean)
    .join(' ')
  return <button {...props} className={className} />
}
