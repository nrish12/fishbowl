import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" showTagline={false} />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Link
            to="/daily"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-forest/20 hover:border-gold"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <Calendar size={26} className="text-gold" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-forest">
                Daily Challenge
              </h2>
              <p className="text-sm text-forest/70 leading-relaxed">
                Today's puzzle for everyone. Compete on the same mystery each day.
              </p>
              <span className="inline-block px-4 py-2 bg-forest text-white rounded-full text-sm font-medium group-hover:bg-gold group-hover:text-forest transition-colors">
                Play Today
              </span>
            </div>
          </Link>

          <Link
            to="/create"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-forest/20 hover:border-forest"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center group-hover:bg-forest/20 transition-colors">
                <Users size={26} className="text-forest" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-forest">
                Custom Challenge
              </h2>
              <p className="text-sm text-forest/70 leading-relaxed">
                Create your own mystery. Share with friends. Challenge anyone.
              </p>
              <span className="inline-block px-4 py-2 bg-cream text-forest border-2 border-forest/20 rounded-full text-sm font-medium group-hover:bg-forest group-hover:text-white group-hover:border-forest transition-colors">
                Create Puzzle
              </span>
            </div>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xs font-semibold text-forest/60 uppercase tracking-wider">
            How to Play
          </h3>
          <div className="flex items-center justify-center gap-6 text-sm text-forest/80">
            <div className="flex flex-col items-center">
              <span className="font-serif text-3xl font-bold text-gold">1</span>
              <span className="text-xs font-medium">Category</span>
            </div>
            <svg width="50" height="20" viewBox="0 0 50 20" className="text-forest" fill="none">
              <path d="M4 10 L46 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M40 5 L46 10 L40 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col items-center">
              <span className="font-serif text-3xl font-bold text-gold">1</span>
              <span className="text-xs font-medium">Sentence</span>
            </div>
            <svg width="50" height="20" viewBox="0 0 50 20" className="text-forest" fill="none">
              <path d="M4 10 L46 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M40 5 L46 10 L40 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col items-center">
              <span className="font-serif text-3xl font-bold text-gold">5</span>
              <span className="text-xs font-medium">Words</span>
            </div>
          </div>
          <p className="text-xs text-forest/60 max-w-md mx-auto pt-1">
            One guess per phase <span className="text-forest font-semibold">unlocks</span> the next. Gold, Silver, or Bronze rank based on when you solve it.
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
