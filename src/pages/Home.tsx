import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles, Settings } from 'lucide-react';
import Logo from '../components/Logo';
import PaperSurface from '../components/paper/PaperSurface';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex flex-col p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(45, 139, 95, 0.1) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full relative z-10 mx-auto flex-1 flex flex-col justify-center py-4 sm:py-6 space-y-4 sm:space-y-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Logo size="lg" showTagline={false} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hero-title text-forest-800 max-w-2xl mx-auto mt-3 leading-tight"
            style={{
              fontSize: 'clamp(24px, 2.5vw, 32px)'
            }}
          >
            5 phases to solve the mystery.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm sm:text-base text-forest-600 max-w-2xl mx-auto mt-2 font-medium"
          >
            Play today's mystery or create your own for friends.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ rotateX: 5, scale: 0.97 }}
            animate={{ rotateX: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <Link to="/daily" className="group">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <PaperSurface
                    variant="lifted"
                    className="h-full transition-all duration-300 ring-2 ring-forest-500/20 bg-gradient-to-br from-white to-forest-50/30 group-hover:shadow-[0_16px_48px_rgba(45,139,95,0.3)] group-hover:ring-forest-500/40"
                  >
                    <div className="flex flex-col items-center text-center space-y-3 p-4 sm:p-5">
                      <motion.div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Calendar size={24} className="text-gold-50" strokeWidth={2.5} />
                      </motion.div>

                      <div className="space-y-1">
                        <h2 className="card-title text-xl sm:text-2xl font-bold text-forest-800">
                          Daily Challenge
                        </h2>
                        <p className="text-xs sm:text-sm text-forest-600 leading-relaxed">
                          A fresh mystery every day.
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-full text-sm font-bold shadow-lg w-full sm:w-auto justify-center group-hover:shadow-xl transition-shadow"
                      >
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                          <Sparkles size={14} />
                        </motion.div>
                        Start Playing
                      </motion.div>
                    </div>
                  </PaperSurface>
                </motion.div>
              </Link>

              <Link to="/create" className="group">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <PaperSurface
                    variant="lifted"
                    className="h-full transition-all duration-300 ring-1 ring-gold-400/20 group-hover:shadow-[0_16px_48px_rgba(245,158,11,0.25)] group-hover:ring-gold-400/40"
                  >
                    <div className="flex flex-col items-center text-center space-y-3 p-4 sm:p-5">
                      <motion.div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: -5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Users size={24} className="text-forest-800" strokeWidth={2.5} />
                      </motion.div>

                      <div className="space-y-1">
                        <h2 className="card-title text-xl sm:text-2xl font-bold text-forest-800">
                          Custom Challenge
                        </h2>
                        <p className="text-xs sm:text-sm text-forest-600 leading-relaxed">
                          Make a mystery for friends.
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-700 text-forest-900 rounded-full text-sm font-bold shadow-lg w-full sm:w-auto justify-center group-hover:shadow-xl transition-shadow"
                      >
                        <Sparkles size={14} />
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
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto w-full"
        >
          <PaperSurface className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-forest-800 text-center mb-3 sm:mb-4">
              How Mystle works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-gold-50 flex items-center justify-center text-lg font-bold mx-auto">
                  1
                </div>
                <h4 className="font-bold text-forest-700 text-sm">Choose a mode</h4>
                <p className="text-xs text-forest-600 leading-relaxed">
                  Daily Challenge or Custom Challenge.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-gold-50 flex items-center justify-center text-lg font-bold mx-auto">
                  2
                </div>
                <h4 className="font-bold text-forest-700 text-sm">Play through five phases</h4>
                <p className="text-xs text-forest-600 leading-relaxed">
                  Unlock clues and refine your guesses.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-forest-600 text-gold-50 flex items-center justify-center text-lg font-bold mx-auto">
                  3
                </div>
                <h4 className="font-bold text-forest-700 text-sm">Share your result</h4>
                <p className="text-xs text-forest-600 leading-relaxed">
                  Send your score or puzzle link to friends.
                </p>
              </div>
            </div>
          </PaperSurface>
        </motion.div>

        {import.meta.env.MODE === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center"
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

      <Footer />
    </div>
  );
}
