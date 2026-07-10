import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1500)
  }

  const handleReset = () => {
    setSuccess(false)
    setEmail('')
  }

  return (
    <div
      className="bg-[#f8f9ff] min-h-screen flex flex-col font-normal text-[#0b1c30] antialiased"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-[800px] h-[800px] rounded-full bg-[#dce9ff] blur-[120px]" />
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),_0_8px_10px_-6px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden border border-[#c3c6d7]/20 fade-in">

          {/* Forgot Password Form */}
          {!success ? (
            <div className="p-12 flex flex-col items-center">
              {/* Header */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#eff4ff] rounded-full flex items-center justify-center mb-4 text-[#004ac6] shadow-sm border border-[#c3c6d7]/10">
                  <span className="material-symbols-outlined text-[32px] icon-fill">lock_reset</span>
                </div>
                <h1 className="text-2xl font-semibold text-[#0b1c30] mb-1 tracking-tight">Forgot Password?</h1>
                <p className="text-base text-[#434655] max-w-[280px]">
                  Enter your registered email address and we'll send you a password reset link.
                </p>
              </div>

              {/* Form */}
              <form className="w-full space-y-4" onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-[#434655]" htmlFor="emailInput">
                    Email Address
                  </label>
                  <div className="relative rounded-lg border border-[#c3c6d7]/50 transition-all duration-200 focus-within:shadow-[0_0_0_4px_rgba(0,74,198,0.1)]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none">mail</span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-lg focus:border-[#004ac6] focus:ring-0 text-base text-[#0b1c30] outline-none transition-colors placeholder:text-[#737686]/50"
                      id="emailInput"
                      placeholder="name@company.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#004ac6] to-[#0053db] text-white rounded-lg text-sm font-semibold shadow-sm border-t border-white/20 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-all duration-150 flex items-center justify-center relative overflow-hidden group"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <div className="loader" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Link
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  className="text-sm font-semibold text-[#5d5f5f] hover:text-[#004ac6] transition-colors flex items-center justify-center gap-2"
                  to="/login"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="p-12 flex flex-col items-center text-center fade-in">
              <div className="w-16 h-16 bg-[#e5eeff] rounded-full flex items-center justify-center mb-4 text-[#004ac6] shadow-sm border border-[#c3c6d7]/10">
                <span className="material-symbols-outlined text-[32px] icon-fill text-[#004ac6]">mark_email_read</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#0b1c30] mb-1 tracking-tight">Check your email</h2>
              <p className="text-base text-[#434655] max-w-[280px] mb-6">
                Password reset link has been sent successfully. Please check your inbox and spam folder.
              </p>
              <div className="w-full space-y-3">
                <Link
                  className="block w-full py-3 px-4 bg-gradient-to-r from-[#004ac6] to-[#0053db] text-white rounded-lg text-sm font-semibold shadow-sm border-t border-white/20 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-all duration-150 text-center"
                  to="/login"
                >
                  Back to Login
                </Link>
                <button
                  className="block w-full py-3 px-4 bg-[#f8f9ff] text-[#5d5f5f] border border-[#c3c6d7]/50 rounded-lg text-sm font-semibold hover:bg-[#eff4ff] transition-colors duration-150"
                  onClick={handleReset}
                >
                  Didn't receive it? Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#c3c6d7]/20 w-full mt-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2 flex flex-col space-y-4 mb-6 md:mb-0">
            <span className="text-xl font-black text-[#0b1c30] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6]">hub</span>
              VendorHub
            </span>
            <p className="text-sm text-[#434655] max-w-xs">
              Empowering vendors with precision tools for high-scale hyperlocal commerce.
            </p>
            <p className="text-sm text-[#c6c6c7] mt-auto pt-6">
              © 2024 VendorHub Inc. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-semibold text-[#0b1c30] mb-1">Platform</span>
            {['Company', 'Features', 'Resources'].map((l) => (
              <a key={l} className="text-sm text-[#5d5f5f] hover:text-[#004ac6] hover:translate-x-1 transition-all duration-150" href="#">{l}</a>
            ))}
          </div>
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-semibold text-[#0b1c30] mb-1">Legal</span>
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} className="text-sm text-[#5d5f5f] hover:text-[#004ac6] hover:translate-x-1 transition-all duration-150" href="#">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
