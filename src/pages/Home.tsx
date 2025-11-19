import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles, Settings, Clock, UserX, Link2, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import PaperSurface from '../components/paper/PaperSurface';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex flex-col p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(45, 139, 95, 0.1) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full relative z-10 mx-auto flex-1 flex flex-col justify-center"
      >
        <div className="text-center mb-8 mt-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Logo size="xl" showTagline={false} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl sm:text-3xl md:text-5xl text-forest-800 font-bold max-w-3xl mx-auto mt-6 leading-tight"
            style={{ fontFamily: '"Space Grotesk", system-ui, -apple-system, sans-serif' }}
          >
            One mystery. Five phases. Can you crack it before your friends do?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-forest-600 max-w-2xl mx-auto mt-4 leading-relaxed font-medium"
          >
            A fast, shareable mystery game. Ask questions, unlock phases, and guess the answer in under five steps.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto mb-8">
          <motion.div
            initial={{ rotateX: 5, scale: 0.97 }}
            animate={{ rotateX: 0, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <Link to="/daily" className="group">
                <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.98 }}>
                  <PaperSurface variant="lifted" className="h-full hover:shadow-[0_12px_40px_rgba(45,139,95,0.25)] transition-all duration-300 ring-2 ring-forest-500/20">
                    <div className="flex flex-col items-center text-center space-y-5 p-6 sm:p-7">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg">
                        <Calendar size={30} className="text-gold-50" strokeWidth={2.5} />
                      </div>

                      <div className="space-y-2 min-h-[100px] flex flex-col justify-center">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-800">
                          Daily Mystery
                        </h2>
                        <p className="text-sm sm:text-base text-forest-600 leading-relaxed">
                          A fresh, curated mystery every day. Compare your result with friends.
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-full text-base font-bold shadow-[0_8px_20px_rgba(45,139,95,0.3)] hover:shadow-[0_12px_28px_rgba(45,139,95,0.4)] transition-shadow w-full sm:w-auto justify-center"
                      >
                        <Sparkles size={18} />
                        <span>Play Today's Puzzle</span>
                        <ArrowRight size={18} className="hidden sm:inline" />
                      </motion.div>
                    </div>
                  </PaperSurface>
                </motion.div>
              </Link>

              <Link to="/create" className="group">
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <PaperSurface variant="lifted" className="h-full hover:shadow-[var(--shadow-envelope)] transition-all duration-300">
                    <div className="flex flex-col items-center text-center space-y-5 p-6 sm:p-7">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                        <Users size={30} className="text-forest-800" strokeWidth={2.5} />
                      </div>

                      <div className="space-y-2 min-h-[100px] flex flex-col justify-center">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-800">
                          Custom Challenge
                        </h2>
                        <p className="text-sm sm:text-base text-forest-600 leading-relaxed">
                          Create your own mystery in seconds and share a link with friends.
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-forest-900 rounded-full text-base font-bold shadow-lg w-full sm:w-auto justify-center"
                      >
                        <Sparkles size={18} />
                        <span>Create a Puzzle</span>
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
          transition={{ delay: 0.9 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-center justify-center gap-3 text-forest-600">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center">
                <Clock size={20} className="text-forest-600" strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-left">
                Takes about 3–5 minutes to play
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 text-forest-600">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center">
                <UserX size={20} className="text-forest-600" strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-left">
                No signup required to start
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 text-forest-600">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center">
                <Link2 size={20} className="text-forest-600" strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-left">
                Share your results & custom links
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <PaperSurface className="p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-forest-800 text-center mb-6">
              How Mystle works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-forest-600 text-gold-50 flex items-center justify-center text-xl font-bold mx-auto">
                  1
                </div>
                <h4 className="font-bold text-forest-700">Choose a mode</h4>
                <p className="text-sm text-forest-600 leading-relaxed">
                  Daily Mystery or Custom Challenge.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-forest-600 text-gold-50 flex items-center justify-center text-xl font-bold mx-auto">
                  2
                </div>
                <h4 className="font-bold text-forest-700">Play through five phases</h4>
                <p className="text-sm text-forest-600 leading-relaxed">
                  Ask questions, unlock clues, and refine your guesses.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-forest-600 text-gold-50 flex items-center justify-center text-xl font-bold mx-auto">
                  3
                </div>
                <h4 className="font-bold text-forest-700">Share your result</h4>
                <p className="text-sm text-forest-600 leading-relaxed">
                  Send your score or custom puzzle link to friends.
                </p>
              </div>
            </div>
          </PaperSurface>
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

      <Footer />
    </div>
  );
}
