import { ReactNode } from 'react'

export default function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  )
}
