import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { password: { label: '비밀번호', type: 'password' } },
      authorize(credentials) {
        if (credentials?.password === process.env.ADMIN_PASSWORD) {
          return { id: 'admin' }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
