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
      <div className="flex items-center gap-3 bg-white border-2 border-neutral-200 rounded-full p-2 shadow-sm focus-within:border-gold focus-within:shadow-md transition-all duration-200">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2 bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!guess.trim() || disabled}
          className="flex items-center justify-center w-10 h-10 bg-neutral-900 text-white rounded-full hover:bg-gold hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
