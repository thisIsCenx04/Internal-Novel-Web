import { type ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className, ...rest }: Props) {
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ')
  return <button className={classes} {...rest} />
}
