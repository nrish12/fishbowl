import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, Users } from 'lucide-react';
import Logo from '../components/Logo';

export default function Home() {
  const [isEnvelopeOpening, setIsEnvelopeOpening] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 paper-texture opacity-30" />

      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4,8" className="text-ink-200" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="4,8" className="text-ink-200" />
      </svg>

      <div className="max-w-5xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-6 animate-[fadeIn_0.8s_ease-out]">
          <Logo size="lg" showTagline={false} />

          <div className="max-w-2xl mx-auto space-y-3">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-ink-500 tracking-tight">
              Five Fold
            </h1>
            <p className="text-xl text-ink-300 font-medium">
              Each clue unfolds like a secret note
            </p>
            <p className="text-base text-ink-200 max-w-lg mx-auto leading-relaxed">
              A daily puzzle where AI guides your thinking—one fold at a time.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Link
            to="/daily"
            className="group relative perspective-1200"
            onMouseEnter={() => setIsEnvelopeOpening(true)}
            onMouseLeave={() => setIsEnvelopeOpening(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-fold-indigo/10 to-fold-purple/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />

            <div className="relative bg-white rounded-2xl p-8 paper-shadow hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] paper-texture">
              <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-fold-indigo/20" />
              <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-fold-indigo/20" />
              <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-fold-indigo/20" />
              <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-fold-indigo/20" />

              <div className="fold-crease absolute top-1/2 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fold-indigo to-fold-purple flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                  <Calendar size={28} className="text-white" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-ink-500">
                    Daily Challenge
                  </h2>
                  <p className="text-ink-300 leading-relaxed text-sm">
                    A fresh mystery unfolds each day. Five phases, five chances to solve it.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-block px-6 py-2.5 bg-gradient-to-r from-fold-indigo to-fold-purple text-white rounded-full text-sm font-semibold shadow-md group-hover:shadow-lg transition-all">
                    Unfold Today's Note
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/create"
            className="group relative perspective-1200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-echo-glow/10 to-echo-soft/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />

            <div className="relative bg-white rounded-2xl p-8 paper-shadow hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] paper-texture">
              <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-echo-glow/20" />
              <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-echo-glow/20" />
              <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-echo-glow/20" />
              <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-echo-glow/20" />

              <div className="fold-crease absolute left-1/2 top-0 bottom-0 w-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                  <Users size={28} className="text-white" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-ink-500">
                    Custom Challenge
                  </h2>
                  <p className="text-ink-300 leading-relaxed text-sm">
                    Craft a mystery note for someone special. Watch them piece it together.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-block px-6 py-2.5 bg-gradient-to-r from-echo-glow to-echo-soft text-white rounded-full text-sm font-semibold shadow-md group-hover:shadow-lg transition-all">
                    Fold Your Own Note
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center space-y-6 max-w-3xl mx-auto animate-[fadeIn_1.2s_ease-out]">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-ink-200" />
              <h3 className="text-sm font-bold text-ink-300 uppercase tracking-[0.2em]">
                How It Unfolds
              </h3>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-ink-200" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 paper-shadow paper-texture">
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { num: 1, label: 'Category', color: 'from-fold-indigo to-fold-purple' },
                { num: 2, label: 'Sentence', color: 'from-fold-indigo to-fold-purple' },
                { num: 3, label: 'Five Words', color: 'from-fold-indigo to-fold-purple' },
                { num: 4, label: 'AI Nudge', color: 'from-echo-glow to-echo-soft' },
                { num: 5, label: 'Full View', color: 'from-echo-glow to-echo-soft' },
              ].map((phase, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-md transform hover:scale-110 transition-transform`}>
                    <span className="font-serif text-xl font-bold text-white">{phase.num}</span>
                  </div>
                  <span className="text-xs font-semibold text-ink-300">{phase.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-ink-200/30">
              <p className="text-sm text-ink-300 leading-relaxed">
                Each wrong guess <span className="font-semibold text-fold-indigo">unfolds another clue</span>.
                The AI watches your thinking and guides you closer.
                Earn <span className="font-semibold text-ink-400">Gold, Silver, or Bronze</span> based on when you solve it.
              </p>
            </div>
          </div>
        </div>

        {import.meta.env.MODE === 'development' && (
          <div className="text-center animate-[fadeIn_1.4s_ease-out]">
            <Link
              to="/dev"
              className="inline-block px-4 py-2 bg-ink-400 text-white text-sm rounded-lg hover:bg-ink-500 transition-colors paper-shadow"
            >
              Developer Tools
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
