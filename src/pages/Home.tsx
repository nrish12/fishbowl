import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12">
        <div className="text-center space-y-6">
          <Logo size="lg" showTagline />
          <p className="text-lg text-neutral-700 leading-relaxed max-w-xl mx-auto">
            Deduce the answer through progressive hints.
            <br />
            Three phases. One chance per phase.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/daily"
            className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 hover:border-gold"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <Calendar size={28} className="text-gold" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-neutral-900">
                Daily Challenge
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                Today's puzzle for everyone. Compete on the same mystery each day.
              </p>
              <span className="inline-block px-4 py-2 bg-neutral-900 text-white rounded-full text-sm font-medium group-hover:bg-gold group-hover:text-neutral-900 transition-colors">
                Play Today
              </span>
            </div>
          </Link>

          <Link
            to="/create"
            className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 hover:border-gold"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-900/10 flex items-center justify-center group-hover:bg-neutral-900/20 transition-colors">
                <Users size={28} className="text-neutral-900" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-neutral-900">
                Custom Challenge
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                Create your own mystery. Share with friends. Challenge anyone.
              </p>
              <span className="inline-block px-4 py-2 bg-neutral-100 text-neutral-900 rounded-full text-sm font-medium group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                Create Puzzle
              </span>
            </div>
          </Link>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            How to Play
          </h3>
          <div className="flex items-center justify-center gap-8 text-sm text-neutral-700">
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl text-gold">1</span>
              <span>Category</span>
            </div>
            <div className="w-8 h-px bg-neutral-300" />
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl text-gold">1</span>
              <span>Sentence</span>
            </div>
            <div className="w-8 h-px bg-neutral-300" />
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl text-gold">5</span>
              <span>Words</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 max-w-md mx-auto pt-2">
            One guess per phase unlocks the next. Gold, Silver, or Bronze rank based on when you solve it.
          </p>
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
