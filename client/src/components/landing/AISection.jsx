import { Sparkles, SearchCode, Heart, TrendingUp, ArrowRight } from 'lucide-react'
import { aiSearchTerms } from '../../data/landingData.js'

export default function AISection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5"
      />
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-surface px-3.5 py-1.5 text-xs font-semibold text-accent shadow-soft">
            <Sparkles size={13} /> Powered by AI
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Shopping That Gets Smarter.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
            VendorHub uses AI to understand what you&apos;re looking for and help you discover
            products you&apos;ll actually love.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recommendations card */}
          <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Heart size={20} />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-text">
              AI Product Recommendations
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
              Recommendations based on browsing history and previous purchases.
            </p>

            <div className="mt-6 space-y-2.5">
              {[
                { label: 'Because you viewed Wireless Earbuds', match: '96% match' },
                { label: 'Popular with buyers near you', match: '91% match' },
                { label: 'Based on your last order', match: '88% match' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-soft px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm text-text-soft">
                    <TrendingUp size={14} className="text-accent" /> {row.label}
                  </span>
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    {row.match}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI search card */}
          <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <SearchCode size={20} />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-text">AI-Powered Search</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">Search naturally.</p>

            <div className="mt-6 rounded-2xl border border-border bg-surface-soft p-4">
              <p className="text-xs font-medium text-text-muted">User searches</p>
              <p className="mt-1.5 flex items-center gap-2 font-display text-[15px] font-semibold text-text">
                <SearchCode size={16} className="text-accent" /> &ldquo;laptop bag&rdquo;
              </p>
              <div className="mt-4 space-y-2">
                {aiSearchTerms.map((term) => (
                  <div
                    key={term}
                    className="flex items-center justify-between rounded-xl bg-surface px-4 py-2.5 shadow-soft"
                  >
                    <span className="text-sm text-text-soft">{term}</span>
                    <ArrowRight size={14} className="text-text-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
