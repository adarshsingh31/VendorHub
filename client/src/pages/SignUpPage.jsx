import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [strength, setStrength] = useState(0)
  const [strengthText, setStrengthText] = useState('Password strength')

  const calcStrength = (val) => {
    let s = 0
    if (val.length > 5) s++
    if (val.length > 8) s++
    if (/[A-Z]/.test(val)) s++
    if (/[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    s = Math.min(s, 4)
    setStrength(s)
    if (!val) { setStrengthText('Password strength'); return }
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    setStrengthText(labels[s] || 'Weak')
  }

  const strengthColors = ['', 'bg-[#ba1a1a]', 'bg-[#ffb95f]', 'bg-[#34A853]', 'bg-[#004ac6]']
  const passwordMismatch = confirmPassword && password !== confirmPassword

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen flex flex-col md:flex-row">
      {/* Left: Illustration */}
      <div className="hidden md:flex flex-col flex-1 bg-[#dce9ff] relative overflow-hidden justify-center items-center p-8">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#2563eb]/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#996100]/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10 max-w-lg text-center">
          <h1 className="text-5xl font-bold text-[#004ac6] tracking-tight mb-4">VendorHub</h1>
          <p className="text-lg text-[#434655] mb-12">Connecting local vendors with a vibrant community of buyers. Scale your business with powerful tools.</p>
          <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl shadow-[#2563eb]/20 border border-[#c3c6d7]/30">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPC6MOUf9JjgMCxUDr45x62FN9lW75ovBxyRQ0nB2a8Jjixkgr496asiP0aFT3OTcjEtNUTrKRzmKz_0anctn0lXDVENx7xi9Hgw4aKsoB0qrXv57O0QP2NWKCffzqqSK4n8PAO0y9txG80gSSbPUIQ6HOq_buf8Bcm9gJwaTvqyGNeItN91wjFNyOtI6AaCiBffKGIuolMKGLbJcNHEP1-djQ2y7icIuX_uuedIO5q1JdG7MfaKI8VNWwxJMveIiXOSbUcBHDgPrS"
              alt="VendorHub marketplace"
            />
          </div>
        </div>
      </div>

      {/* Right: Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] relative min-h-screen">
        {/* Mobile Brand */}
        <div className="md:hidden flex items-center justify-center mb-12">
          <span className="material-symbols-outlined text-[#004ac6] text-4xl mr-2 icon-fill">hub</span>
          <span className="text-[32px] font-bold tracking-tight text-[#004ac6]">VendorHub</span>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-2xl font-semibold text-[#0b1c30] mb-2">Create Your Account</h2>
            <p className="text-sm text-[#434655]">Join VendorHub and start shopping locally.</p>
          </div>

          <div className="mt-6">
            <form className="space-y-4" id="signupForm">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="name">Full Name</label>
                <input
                  autoComplete="name"
                  className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
                  id="name"
                  name="name"
                  required
                  type="text"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="email">Email address</label>
                <input
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
                  id="email"
                  name="email"
                  required
                  type="email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="phone">Phone Number</label>
                <input
                  autoComplete="tel"
                  className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow"
                  id="phone"
                  name="phone"
                  required
                  type="tel"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="password">Password</label>
                <div className="mt-1 relative">
                  <input
                    autoComplete="new-password"
                    className="appearance-none block w-full px-3 py-3 border border-[#c3c6d7] rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] text-sm transition-all duration-150 input-glow pr-10"
                    id="password"
                    name="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); calcStrength(e.target.value) }}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#004ac6] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {/* Strength Meter */}
                <div className="mt-2 flex gap-1 h-1 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors duration-300 ${password.length > 0 && i <= Math.max(1, strength) ? strengthColors[strength] : 'bg-[#dce9ff]'}`}
                    />
                  ))}
                </div>
                <p className={`mt-1 text-xs ${strength <= 1 ? 'text-[#ba1a1a]' : strength === 2 ? 'text-[#ffb95f]' : 'text-[#004ac6]'}`}>
                  {strengthText}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-[#434655] mb-1" htmlFor="confirm_password">Confirm Password</label>
                <div className="mt-1 relative">
                  <input
                    autoComplete="new-password"
                    className={`appearance-none block w-full px-3 py-3 border rounded-lg bg-white text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-2 text-sm transition-all duration-150 input-glow ${passwordMismatch ? 'border-[#ba1a1a] focus:ring-[#ba1a1a] focus:border-[#ba1a1a]' : 'border-[#c3c6d7] focus:ring-[#004ac6] focus:border-[#004ac6]'}`}
                    id="confirm_password"
                    name="confirm_password"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {passwordMismatch && (
                  <p className="mt-1 text-xs text-[#ba1a1a]">Passwords do not match.</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-[#004ac6] focus:ring-[#004ac6] border-[#c3c6d7] rounded bg-white transition-colors cursor-pointer"
                  id="terms"
                  name="terms"
                  required
                  type="checkbox"
                />
                <label className="ml-2 block text-sm text-[#434655]" htmlFor="terms">
                  I agree to the{' '}
                  <a className="text-[#004ac6] hover:text-[#2563eb] font-medium transition-colors" href="#">Terms</a>
                  {' '}and{' '}
                  <a className="text-[#004ac6] hover:text-[#2563eb] font-medium transition-colors" href="#">Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <div>
                <button
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004ac6] transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-95"
                  type="submit"
                >
                  Create Account
                </button>
              </div>
            </form>

            {/* Social Sign Up */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#c3c6d7]/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-sm text-[#434655]">Or continue with</span>
                </div>
              </div>
              <div className="mt-4">
                <a className="w-full inline-flex justify-center items-center gap-3 py-2.5 px-4 border border-[#c3c6d7]/50 rounded-lg shadow-sm bg-white text-sm font-medium text-[#0b1c30] hover:bg-[#eff4ff] transition-colors duration-150" href="#">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </a>
              </div>
            </div>
          </div>

          <p className="mt-12 text-center text-sm text-[#434655]">
            Already have an account?{' '}
            <Link className="text-sm font-semibold text-[#004ac6] hover:text-[#2563eb] transition-colors" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
