/**
 * GoogleSignInButton.jsx
 *
 * A reusable "Continue with Google" button that matches VendorHub's design system.
 *
 * Strategy:
 *   @react-oauth/google's <GoogleLogin> is the only way to receive a credential
 *   (Google ID token / id_token) directly in the browser. Its built-in button
 *   cannot be fully styled, so we use the "transparent overlay" technique:
 *     1. Render our custom-styled button as the visible layer.
 *     2. Overlay a completely transparent <GoogleLogin> on top — when the user
 *        clicks our button they actually click Google's button underneath.
 *     3. <GoogleLogin>'s onSuccess fires with { credential }, which we forward
 *        to the parent via the onSuccess prop.
 *
 * Props:
 *   onSuccess(credential: string) — called with the raw Google ID token on success
 *   onError(message: string)      — called with a human-readable error on failure
 *   loading: boolean              — disables the button and shows a spinner
 */

import { GoogleLogin } from '@react-oauth/google'

// ─── Google Logo SVG ──────────────────────────────────────────────────────────
// Inline so there are no extra asset dependencies.
function GoogleLogo() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GoogleSignInButton({ onSuccess, onError, loading = false }) {
  return (
    /**
     * Outer wrapper — `relative` so the transparent GoogleLogin overlay
     * can be positioned absolutely on top of our custom button.
     */
    <div className="relative w-full">

      {/* ── Our custom-styled visible button ─────────────────────────────── */}
      <button
        type="button"
        disabled={loading}
        aria-label="Continue with Google"
        className="w-full bg-white border border-[#c3c6d7]/50 text-[#0b1c30] text-sm font-semibold py-3 rounded-lg flex justify-center items-center gap-3 hover:bg-[#eff4ff] hover:border-[#004ac6]/30 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          // Spinner reuses the existing .loader CSS class from index.css
          <div className="loader" />
        ) : (
          <GoogleLogo />
        )}
        <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
      </button>

      {/*
       * ── Transparent <GoogleLogin> overlay ──────────────────────────────
       *
       * Positioned absolutely, covers the full button area, opacity 0.
       * The user sees our styled button but clicks Google's hidden button.
       * This is the recommended pattern when you need the credential (id_token)
       * directly in the browser from @react-oauth/google.
       *
       * `width` on <GoogleLogin> controls the size of the Google button iframe.
       * We set it to a large value so it reliably covers the full wrapper.
       */}
      {!loading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 overflow-hidden rounded-lg"
          style={{ cursor: 'pointer' }}
        >
          <GoogleLogin
            width="500"
            onSuccess={(credentialResponse) => {
              /**
               * credentialResponse.credential is the Google ID token (a JWT).
               * We forward it to the parent so it can POST it to the backend.
               */
              if (credentialResponse?.credential) {
                onSuccess(credentialResponse.credential)
              } else {
                onError('Google did not return a credential. Please try again.')
              }
            }}
            onError={() => {
              onError('Google sign-in was cancelled or failed. Please try again.')
            }}
            useOneTap={false}
          />
        </div>
      )}
    </div>
  )
}
