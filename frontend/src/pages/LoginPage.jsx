import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email)
      if (result.success) {
        setSent(true)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-purple-500">distill.</span>
          </h1>
          <p className="text-slate-400">Your reels, turned into knowledge</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 shadow-xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-900/50 text-purple-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✉️
              </div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-slate-400">
                We've sent a magic link to <span className="text-white font-medium">{email}</span>.
                Click the link to sign in.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
              >
                ← Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium rounded-lg transition"
              >
                {loading ? 'Sending magic link...' : 'Sign in with magic link'}
              </button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-slate-400 text-sm mt-6">
              We'll send you a link to log in. No password needed.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
