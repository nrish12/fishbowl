import { useState } from 'react';
import { Send } from 'lucide-react';

interface GuessBarProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function GuessBar({ onSubmit, disabled = false, placeholder = "Type your guess..." }: GuessBarProps) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && !disabled) {
      onSubmit(guess.trim());
      setGuess('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-forest-400 to-gold-400 rounded-full blur opacity-25" />

        <div className="relative flex items-center gap-2 sm:gap-3 bg-paper-cream border-2 border-forest-300 rounded-full p-1.5 sm:p-2 secret-note-shadow paper-texture focus-within:border-forest-500 focus-within:shadow-xl transition-all duration-300">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={50}
            aria-label="Enter your guess"
            autoComplete="off"
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-transparent text-sm sm:text-base text-ink-charcoal placeholder-forest-400 focus:outline-none disabled:opacity-50 font-medium"
          />
          <button
            type="submit"
            disabled={!guess.trim() || disabled}
            aria-label="Submit guess"
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-forest-500 to-forest-600 text-gold-100 rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:from-forest-600 hover:to-forest-700"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}
