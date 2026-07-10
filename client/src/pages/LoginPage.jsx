import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/70 backdrop-blur-xl shadow-sm border-b border-[#c3c6d7]/30 h-20 flex items-center px-4 md:px-8">
        <div className="max-w-[1280px] w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill text-[#004ac6]">hub</span>
            <span className="text-2xl font-bold tracking-tight text-[#004ac6]">VendorHub</span>
          </div>
        </div>
      </header>

      {/* Main Content Split Screen */}
      <main className="flex-1 flex flex-col md:flex-row mt-20">
        {/* Left Side: Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-[#eff4ff] relative overflow-hidden flex-col justify-center items-center p-12">
          <div className="absolute inset-0 z-0">
            <div
              className="bg-cover bg-center w-full h-full opacity-90 mix-blend-multiply"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzs-Tf660zWvTjRKWuvhF5orUXNQHPW8sH5efhhp0R6uL4dEO12A2nn1sEAhXeJvJqeqXmxLX0P-T-9KjOUNPLOM_gTeIoe9wkqOaK_xvFuF2Mh8V8XlxF1qKlB3pSce4xpJaOC_xG2voHmRwjiNby3UE8PzoRaOmy09nSUlQZdgZHJVoc4vhGuO5akB3WlVWV2YbnXZOgDwUvsbz-SN9dUNUYuihJ8qSGRfN_lJ3E207VVoGoXnutDDtslM8-NcblS6GZdm0terF7')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9ff]/40 to-[#2563eb]/20 backdrop-blur-[2px]" />
          </div>
          <div className="relative z-10 max-w-md text-center text-[#0b1c30]">
            <h2 className="text-[32px] md:text-[48px] font-bold mb-4 text-[#0b1c30]">Empowering Local Commerce</h2>
            <p className="text-lg text-[#434655]">Join thousands of vendors and shoppers building a stronger community ecosystem.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white">
          <div className="w-full max-w-[420px] bg-white md:rounded-xl md:shadow-[0_1px_3px_0_rgba(0,0,0,0.05),_0_1px_2px_-1px_rgba(0,0,0,0.05)] md:p-12 flex flex-col gap-6">
            {/* Header */}
            <div className="text-center md:text-left mb-2">
              <h1 className="text-[32px] font-bold text-[#0b1c30] mb-1">Welcome Back 👋</h1>
              <p className="text-base text-[#434655]">Login to continue shopping from nearby vendors.</p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4 w-full">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#434655]" htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#737686]">mail</span>
                  </div>
                  <input
                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-base focus:border-[#004ac6] focus:ring focus:ring-[#004ac6]/10 input-transition outline-none"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                    type="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#434655]" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#737686]">lock</span>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-base focus:border-[#004ac6] focus:ring focus:ring-[#004ac6]/10 input-transition outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#0b1c30] transition-colors focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between mt-1 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input className="w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]/20 bg-white" type="checkbox" />
                  <span className="text-sm text-[#434655]">Remember Me</span>
                </label>
                <Link className="text-sm font-semibold text-[#004ac6] hover:text-[#003ea8] transition-colors" to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                className="w-full bg-gradient-to-r from-[#004ac6] to-[#0053db] text-white text-sm font-semibold py-3 rounded-lg shadow-sm border-b border-white/20 btn-primary flex justify-center items-center gap-2 transition-all duration-150"
                type="submit"
              >
                <span>Login</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#c3c6d7]/30" />
              <span className="flex-shrink-0 mx-4 text-xs text-[#737686] uppercase tracking-wider">OR</span>
              <div className="flex-grow border-t border-[#c3c6d7]/30" />
            </div>

            {/* Social Login */}
            <div className="flex flex-col gap-3">
              <button className="w-full bg-white border border-[#c3c6d7]/50 text-[#0b1c30] text-sm font-semibold py-3 rounded-lg flex justify-center items-center gap-3 hover:bg-[#f1f5f9] transition-colors duration-150 shadow-sm" type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-[#434655] mt-2">
              Don't have an account?{' '}
              <Link className="text-sm font-semibold text-[#004ac6] hover:underline" to="/signup">Create Account</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#c3c6d7]/20 py-6 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#5d5f5f]">© 2024 VendorHub Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-sm text-[#5d5f5f] hover:text-[#004ac6] transition-colors" href="#">Privacy</a>
            <a className="text-sm text-[#5d5f5f] hover:text-[#004ac6] transition-colors" href="#">Terms</a>
            <a className="text-sm text-[#5d5f5f] hover:text-[#004ac6] transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
