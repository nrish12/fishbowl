import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-parchment/80 backdrop-blur-sm border-t border-forest-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-forest-600">
        <Link to="/privacy" className="hover:text-forest-800 transition-colors">
          Privacy Policy
        </Link>
        <span className="hidden sm:inline text-forest-300">•</span>
        <Link to="/terms" className="hover:text-forest-800 transition-colors">
          Terms of Service
        </Link>
        <span className="hidden sm:inline text-forest-300">•</span>
        <span className="text-forest-500">
          © {new Date().getFullYear()} Five Fold
        </span>
      </div>
    </footer>
  );
}
