import { ButtonHTMLAttributes } from 'react'

const VARIANT_CLASSES = {
  primary: 'bg-blue-600 text-white disabled:opacity-60',
  secondary: 'bg-gray-200 text-gray-900',
  danger: 'bg-red-500 text-white',
} as const

type Variant = keyof typeof VARIANT_CLASSES

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`rounded-md px-4 py-2 text-sm ${VARIANT_CLASSES[variant]} ${className}`}
    />
  )
}
