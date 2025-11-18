import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-parchment/80 backdrop-blur-sm border-t border-forest-200 py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-6 text-sm text-forest-600">
        <Link to="/privacy" className="hover:text-forest-800 transition-colors">
          Privacy Policy
        </Link>
        <span className="text-forest-300">•</span>
        <Link to="/terms" className="hover:text-forest-800 transition-colors">
          Terms of Service
        </Link>
        <span className="text-forest-300">•</span>
        <span className="text-forest-500">
          © {new Date().getFullYear()} Five Fold
        </span>
      </div>
    </footer>
  );
}
