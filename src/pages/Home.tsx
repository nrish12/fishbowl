import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';
import PaperSurface from '../components/paper/PaperSurface';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 paper-texture opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
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
            className="text-5xl md:text-6xl font-serif font-bold text-forest-800 tracking-tight"
          >
            Five Fold
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-forest-600 italic font-medium"
          >
            Each clue unfolds like a secret note
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base text-ink-muted max-w-2xl mx-auto leading-relaxed"
          >
            A daily puzzle where AI guides your thinking—one fold at a time
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="absolute -inset-8 bg-gradient-to-br from-forest-500/10 via-gold-500/5 to-forest-500/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />

          <div className="relative perspective-1200">
            <motion.div
              initial={{ rotateX: 10, scale: 0.95 }}
              animate={{ rotateX: 0, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="transform-gpu"
            >
              <PaperSurface className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-forest-500/20 to-transparent" />
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-forest-500/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-forest-50/30 to-gold-50/30" />

                <div className="fold-crease absolute top-1/2 left-12 right-12 h-px opacity-40" />
                <div className="fold-crease absolute left-1/2 top-12 bottom-12 w-px opacity-40" />

                <div className="relative grid md:grid-cols-2 gap-8 p-8">
                  <Link
                    to="/daily"
                    className="group relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PaperSurface variant="lifted" className="h-full hover:shadow-[var(--shadow-envelope)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-forest-500/0 to-forest-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative flex flex-col items-center text-center space-y-6 p-4">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg relative"
                          >
                            <div className="absolute inset-0 rounded-full bg-forest-300/30 animate-ping" style={{ animationDuration: '3s' }} />
                            <Calendar size={32} className="text-gold-50 relative z-10" strokeWidth={2.5} />
                          </motion.div>

                          <div className="space-y-3">
                            <h2 className="text-2xl font-serif font-bold text-forest-800">
                              Daily Challenge
                            </h2>
                            <p className="text-sm text-forest-600 leading-relaxed">
                              A fresh mystery unfolds each day. Five phases, five chances to solve it. Can you unfold the answer?
                            </p>
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-full text-sm font-bold shadow-lg group-hover:shadow-xl transition-all"
                          >
                            <Sparkles size={16} />
                            Unfold Today's Mystery
                          </motion.div>
                        </div>
                      </PaperSurface>
                    </motion.div>
                  </Link>

                  <Link
                    to="/create"
                    className="group relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PaperSurface variant="lifted" className="h-full hover:shadow-[var(--shadow-envelope)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 to-gold-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative flex flex-col items-center text-center space-y-6 p-4">
                          <motion.div
                            whileHover={{ rotate: -360 }}
                            transition={{ duration: 0.6 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg relative"
                          >
                            <div className="absolute inset-0 rounded-full bg-gold-300/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
                            <Users size={32} className="text-forest-800 relative z-10" strokeWidth={2.5} />
                          </motion.div>

                          <div className="space-y-3">
                            <h2 className="text-2xl font-serif font-bold text-forest-800">
                              Custom Challenge
                            </h2>
                            <p className="text-sm text-forest-600 leading-relaxed">
                              Craft a mystery note for someone special. Watch as they piece together your secret.
                            </p>
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-700 text-forest-900 rounded-full text-sm font-bold shadow-lg group-hover:shadow-xl transition-all"
                          >
                            <Sparkles size={16} />
                            Fold Your Own Note
                          </motion.div>
                        </div>
                      </PaperSurface>
                    </motion.div>
                  </Link>
                </div>
              </PaperSurface>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-forest-400 to-transparent" />
              <h3 className="text-xs font-bold text-forest-600 uppercase tracking-[0.3em]">
                How It Unfolds
              </h3>
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-forest-400 to-transparent" />
            </div>
          </div>

          <div className="flex justify-center gap-3 flex-wrap mb-6">
            {[
              { num: 1, label: 'Category', color: 'forest' },
              { num: 2, label: 'Sentence', color: 'forest' },
              { num: 3, label: 'Five Words', color: 'forest' },
              { num: 4, label: 'AI Nudge', color: 'gold' },
              { num: 5, label: 'Visual', color: 'gold' },
            ].map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.1 + idx * 0.1, duration: 0.4, type: 'spring' }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-14 h-14 rounded-full ${
                    phase.color === 'forest'
                      ? 'bg-gradient-to-br from-forest-500 to-forest-700 shadow-lg shadow-forest-500/30'
                      : 'bg-gradient-to-br from-gold-500 to-gold-700 shadow-lg shadow-gold-500/30'
                  } flex items-center justify-center transform hover:scale-110 hover:rotate-12 transition-all cursor-default`}
                >
                  <span className="font-serif text-xl font-bold text-white">{phase.num}</span>
                </div>
                <span className="text-xs font-bold text-forest-700">{phase.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-sm text-center text-ink-muted leading-relaxed max-w-xl mx-auto"
          >
            Each wrong guess <span className="font-bold text-forest-600">unfolds another clue</span>.
            The AI watches your thinking and guides you closer.
            Earn <span className="font-bold text-gold-600">Gold</span>, <span className="font-bold text-ink-light">Silver</span>, or <span className="font-bold text-amber-700">Bronze</span> based on how quickly you solve it.
          </motion.p>
        </motion.div>

        {import.meta.env.MODE === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center mt-12"
          >
            <Link
              to="/dev"
              className="inline-block px-4 py-2 bg-ink-muted/20 hover:bg-ink-muted/30 text-ink-primary text-xs rounded-lg transition-colors backdrop-blur-sm border border-ink-muted/20"
            >
              Developer Tools
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
