'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Card from '../../components/Card'
import Field from '../../components/Field'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'
import { isQa } from '../../lib/env'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', { password, redirect: false })

    setLoading(false)

    if (result?.error) {
      setError('비밀번호가 올바르지 않습니다.')
      return
    }

    router.push('/schedules')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Card className="mx-auto mt-20 max-w-sm">
        <h2 className="mb-4 text-lg font-semibold">티켓팅 알람 어드민{isQa && ' (QA)'}</h2>
        <form onSubmit={handleSubmit}>
          <Field label="비밀번호">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? '확인 중...' : '로그인'}
          </Button>
          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </form>
      </Card>
    </div>
  )
}
