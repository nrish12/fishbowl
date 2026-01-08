import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Landmark, Trophy, Globe, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';
import PaperSurface from '../components/paper/PaperSurface';
import Footer from '../components/Footer';
import { trackInteraction } from '../utils/tracking';

export type DailyCategory = 'pop_culture' | 'history_science' | 'sports' | 'geography';

interface CategoryOption {
  id: DailyCategory;
  name: string;
  description: string;
  icon: typeof Film;
  gradient: string;
  iconBg: string;
  ring: string;
  hoverShadow: string;
}

const categories: CategoryOption[] = [
  {
    id: 'pop_culture',
    name: 'Pop Culture',
    description: 'Celebrities, movies, TV shows, and viral moments',
    icon: Film,
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    ring: 'ring-rose-400/30 hover:ring-rose-400/50',
    hoverShadow: 'group-hover:shadow-[0_16px_48px_rgba(244,63,94,0.25)]',
  },
  {
    id: 'history_science',
    name: 'History & Science',
    description: 'Historical figures, inventions, and discoveries',
    icon: Landmark,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    ring: 'ring-amber-400/30 hover:ring-amber-400/50',
    hoverShadow: 'group-hover:shadow-[0_16px_48px_rgba(245,158,11,0.25)]',
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Athletes, teams, and legendary moments',
    icon: Trophy,
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    ring: 'ring-emerald-400/30 hover:ring-emerald-400/50',
    hoverShadow: 'group-hover:shadow-[0_16px_48px_rgba(16,185,129,0.25)]',
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Places, landmarks, and natural wonders',
    icon: Globe,
    gradient: 'from-sky-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    ring: 'ring-sky-400/30 hover:ring-sky-400/50',
    hoverShadow: 'group-hover:shadow-[0_16px_48px_rgba(14,165,233,0.25)]',
  },
];

export default function DailyCategoryPicker() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<DailyCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorySelect = (categoryId: DailyCategory) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);

    const categoryOption = categories.find(c => c.id === categoryId);
    trackInteraction('daily_category_select', categoryId, categoryOption?.name, {
      category: categoryId,
      category_name: categoryOption?.name,
      date: new Date().toISOString().split('T')[0],
    });

    navigate(`/daily/${categoryId}`);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
        className="max-w-4xl w-full relative z-10 mx-auto flex-1 flex flex-col py-4 sm:py-6"
      >
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Logo size="md" showTagline={false} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 space-y-2"
          >
            <p className="text-sm text-forest-500 font-medium">{today}</p>
            <h1
              className="hero-title text-forest-800 max-w-xl mx-auto leading-tight"
              style={{ fontSize: 'clamp(22px, 2.5vw, 28px)' }}
            >
              Choose Your Daily Challenge
            </h1>
            <p className="text-sm text-forest-600">
              Pick a category and solve today's mystery
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                onClick={() => handleCategorySelect(category.id)}
                disabled={isLoading}
                className="group text-left w-full"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <PaperSurface
                    variant="lifted"
                    className={`h-full transition-all duration-300 ring-1 ${category.ring} ${category.hoverShadow} ${
                      isSelected ? 'ring-2 ring-forest-500' : ''
                    } ${isLoading && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3 p-4 sm:p-5">
                      <motion.div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${category.iconBg} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon size={24} className="text-white" strokeWidth={2.5} />
                      </motion.div>

                      <div className="space-y-1">
                        <h2 className="card-title text-lg sm:text-xl font-bold text-forest-800">
                          {category.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-forest-600 leading-relaxed">
                          {category.description}
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${category.gradient} text-white rounded-full text-sm font-bold shadow-lg w-full sm:w-auto justify-center group-hover:shadow-xl transition-shadow`}
                      >
                        {isSelected && isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Play
                          </>
                        )}
                      </motion.div>
                    </div>
                  </PaperSurface>
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-forest-500">
            New challenges every day at midnight
          </p>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}
