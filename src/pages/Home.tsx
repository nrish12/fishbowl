import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles, Settings } from 'lucide-react';
import Logo from '../components/Logo';
import PaperSurface from '../components/paper/PaperSurface';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(45, 139, 95, 0.1) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full relative z-10"
      >
        <div className="text-center mb-6 space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Logo size="xl" showTagline={false} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base text-forest-700 font-medium max-w-xl mx-auto mt-4"
          >
            Five phases to solve the mystery.
          </motion.p>
        </div>

        <div className="relative max-w-3xl mx-auto mb-6">
          <motion.div
            initial={{ rotateX: 5, scale: 0.97 }}
            animate={{ rotateX: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/daily" className="group">
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <PaperSurface variant="lifted" className="h-full hover:shadow-[var(--shadow-envelope)] transition-all duration-300">
                    <div className="flex flex-col items-center text-center space-y-4 p-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg">
                        <Calendar size={28} className="text-gold-50" strokeWidth={2.5} />
                      </div>

                      <div className="space-y-2 min-h-[100px] flex flex-col justify-center">
                        <h2 className="text-2xl font-serif font-bold text-forest-800">
                          Daily Challenge
                        </h2>
                        <p className="text-sm text-forest-600 leading-relaxed">
                          A fresh mystery each day. Can you solve it?
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-full text-sm font-bold shadow-lg"
                      >
                        <Sparkles size={16} />
                        Start Playing
                      </motion.div>
                    </div>
                  </PaperSurface>
                </motion.div>
              </Link>

              <Link to="/create" className="group">
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <PaperSurface variant="lifted" className="h-full hover:shadow-[var(--shadow-envelope)] transition-all duration-300">
                    <div className="flex flex-col items-center text-center space-y-4 p-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg">
                        <Users size={28} className="text-forest-800" strokeWidth={2.5} />
                      </div>

                      <div className="space-y-2 min-h-[100px] flex flex-col justify-center">
                        <h2 className="text-2xl font-serif font-bold text-forest-800">
                          Custom Challenge
                        </h2>
                        <p className="text-sm text-forest-600 leading-relaxed">
                          Create a mystery for friends to solve.
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-700 text-forest-900 rounded-full text-sm font-bold shadow-lg"
                      >
                        <Sparkles size={16} />
                        Create Puzzle
                      </motion.div>
                    </div>
                  </PaperSurface>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <p className="text-xs text-ink-muted max-w-lg mx-auto">
            Each wrong guess unfolds another clue. Earn Gold, Silver, or Bronze!
          </p>
        </motion.div>

        {import.meta.env.MODE === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-4"
          >
            <Link
              to="/dev"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink-muted/20 hover:bg-ink-muted/30 text-ink-primary text-xs rounded-lg transition-colors"
            >
              <Settings size={14} />
              Dev Tools
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
