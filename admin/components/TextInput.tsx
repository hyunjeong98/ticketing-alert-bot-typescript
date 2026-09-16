import { forwardRef, InputHTMLAttributes } from 'react'

const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className = '', ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        className={`w-full min-w-0 appearance-none rounded-md border border-gray-300 px-3 py-2 text-base ${className}`}
      />
    )
  }
)

export default TextInput
