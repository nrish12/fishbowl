import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-paper-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 paper-texture opacity-40" />

      <div className="max-w-4xl w-full relative z-10 py-8">
        <div className="text-center space-y-6 mb-8">
          <Logo size="md" showTagline={false} />

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-forest-800 tracking-tight">
              Five Fold
            </h1>
            <p className="text-lg sm:text-xl text-forest-600 font-medium italic">
              Each clue unfolds like a secret note
            </p>
            <p className="text-sm sm:text-base text-ink-300 max-w-md mx-auto">
              A daily puzzle where AI guides your thinking—one fold at a time.
            </p>
          </div>
        </div>

        <div className="relative max-w-2xl mx-auto mb-10">
          <div className="absolute -inset-6 bg-gradient-to-br from-forest-300/20 to-gold-300/20 blur-2xl" />

          <div className="relative bg-paper-cream rounded-3xl p-6 sm:p-8 secret-note-shadow border-2 border-forest-400/20 paper-texture">
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-forest-500/30" />
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gold-500/40" />
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gold-500/40" />
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-forest-500/30" />

            <div className="fold-crease absolute top-1/2 left-8 right-8 h-px" />
            <div className="fold-crease absolute left-1/2 top-8 bottom-8 w-px" />

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <Link
                to="/daily"
                className="group relative bg-gradient-to-br from-forest-50 to-forest-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-forest-300/30 hover:scale-105 transform"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-forest-500/0 to-forest-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-gold-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-xl font-serif font-bold text-forest-800 mb-1">
                      Daily Challenge
                    </h2>
                    <p className="text-sm text-forest-600 leading-snug">
                      A fresh mystery unfolds each day. Five phases, five chances to solve it.
                    </p>
                  </div>

                  <span className="inline-block px-5 py-2 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-full text-sm font-semibold shadow-md group-hover:shadow-lg transition-all">
                    Unfold Today
                  </span>
                </div>
              </Link>

              <Link
                to="/create"
                className="group relative bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gold-300/40 hover:scale-105 transform"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 to-gold-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-forest-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-xl font-serif font-bold text-forest-800 mb-1">
                      Custom Challenge
                    </h2>
                    <p className="text-sm text-forest-600 leading-snug">
                      Craft a mystery note for someone special. Watch them piece it together.
                    </p>
                  </div>

                  <span className="inline-block px-5 py-2 bg-gradient-to-r from-gold-600 to-gold-700 text-forest-800 rounded-full text-sm font-semibold shadow-md group-hover:shadow-lg transition-all">
                    Fold Your Own
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-forest-300 to-transparent" />
            <h3 className="text-xs font-bold text-forest-600 uppercase tracking-widest">
              How It Unfolds
            </h3>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-forest-300 to-transparent" />
          </div>

          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Sentence' },
              { num: 3, label: 'Words' },
              { num: 4, label: 'Nudge' },
              { num: 5, label: 'View' },
            ].map((phase, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${idx < 3 ? 'bg-gradient-to-br from-forest-500 to-forest-600' : 'bg-gradient-to-br from-gold-500 to-gold-600'} flex items-center justify-center shadow-md`}>
                  <span className="font-serif text-base sm:text-lg font-bold text-white">{phase.num}</span>
                </div>
                <span className="text-xs font-medium text-forest-700">{phase.label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-ink-300 mt-4 leading-relaxed max-w-lg mx-auto">
            Each wrong guess <span className="font-semibold text-forest-600">unfolds another clue</span>.
            The AI watches your thinking. Earn <span className="font-semibold text-gold-600">Gold, Silver, or Bronze</span>.
          </p>
        </div>

        {import.meta.env.MODE === 'development' && (
          <div className="text-center mt-6">
            <Link
              to="/dev"
              className="inline-block px-4 py-2 bg-ink-400 text-white text-xs rounded-lg hover:bg-ink-500 transition-colors"
            >
              Dev Tools
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
