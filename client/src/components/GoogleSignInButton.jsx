import { GoogleLogin } from "@react-oauth/google";

// Google logo
function GoogleLogo() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  loading = false,
}) {
  return (
    <div className="relative w-full">
      {/* Visible custom button */}
      <button
        type="button"
        disabled={loading}
        aria-label="Continue with Google"
        className="w-full bg-white border border-[#c3c6d7]/50 text-[#0b1c30] text-sm font-semibold py-3 rounded-lg flex justify-center items-center gap-3 hover:bg-[#eff4ff] hover:border-[#004ac6]/30 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <div className="loader" /> : <GoogleLogo />}

        <span>{loading ? "Signing in…" : "Continue with Google"}</span>
      </button>

      {/* Google button stays mounted */}
      <div
        className={`absolute inset-0 overflow-hidden rounded-lg ${
          loading ? "pointer-events-none" : ""
        }`}
        style={{ cursor: loading ? "default" : "pointer" }}
      >
        <GoogleLogin
          width="500"
          onSuccess={(credentialResponse) => {
            if (credentialResponse?.credential) {
              onSuccess(credentialResponse.credential);
            } else {
              onError("Google did not return a credential. Please try again.");
            }
          }}
          onError={() => {
            onError(
              "Google sign-in was cancelled or failed. Please try again.",
            );
          }}
          useOneTap={false}
        />
      </div>
    </div>
  );
}
