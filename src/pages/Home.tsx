import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" showTagline={true} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/daily"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-forest/20 hover:border-gold"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <Calendar size={28} className="text-gold" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-forest">
                Daily Challenge
              </h2>
              <p className="text-forest/70 leading-relaxed">
                A fresh mystery unfolds each day. Can you solve it before the final clue?
              </p>
              <span className="inline-block px-5 py-2.5 bg-forest text-white rounded-full text-sm font-medium group-hover:bg-gold group-hover:text-forest transition-colors">
                Play Today
              </span>
            </div>
          </Link>

          <Link
            to="/create"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-forest/20 hover:border-gold"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <Users size={28} className="text-gold" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-forest">
                Custom Challenge
              </h2>
              <p className="text-forest/70 leading-relaxed">
                Craft a secret note. Send it to a friend. Watch them piece it together.
              </p>
              <span className="inline-block px-5 py-2.5 bg-forest text-white rounded-full text-sm font-medium group-hover:bg-gold group-hover:text-forest transition-colors">
                Create Puzzle
              </span>
            </div>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-sm font-semibold text-forest/60 uppercase tracking-wider">
            How It Unfolds
          </h3>
          <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="grid grid-cols-5 gap-2 text-xs text-forest/80">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-400 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-lg font-bold text-white">1</span>
                </div>
                <span className="font-semibold">Category</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-400 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-lg font-bold text-white">2</span>
                </div>
                <span className="font-semibold">Sentence</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-400 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-lg font-bold text-white">3</span>
                </div>
                <span className="font-semibold">Five Words</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-lg font-bold text-white">4</span>
                </div>
                <span className="font-semibold">AI Nudge</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
                  <span className="font-serif text-lg font-bold text-white">5</span>
                </div>
                <span className="font-semibold">Full View</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="text-sm text-forest/70 leading-relaxed">
                Each wrong guess <span className="text-forest font-semibold">unfolds</span> another clue. Earn Gold, Silver, or Bronze based on how quickly you solve it. Five chances total—with AI-powered help in later phases.
              </p>
            </div>
          </div>
        </div>

        {import.meta.env.MODE === 'development' && (
          <div className="text-center">
            <Link
              to="/dev"
              className="inline-block px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Developer Tools
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
