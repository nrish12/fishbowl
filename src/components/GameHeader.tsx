import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function GameHeader() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-paper-100/95 backdrop-blur-md border-b-2 border-forest-300/20 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-forest-700 hover:text-forest-900 transition-colors group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center group-hover:bg-forest-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </motion.div>
          <span className="text-sm font-semibold hidden sm:inline">Back</span>
        </Link>

        <Logo size="md" showTagline={false} />

        <div className="w-20"></div>
      </div>
    </motion.header>
  );
}
