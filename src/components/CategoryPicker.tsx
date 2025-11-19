import { Globe, Clock, Sparkles, BarChart3, Eye } from 'lucide-react';

interface CategoryPickerProps {
  categories: {
    geography: string;
    history: string;
    culture: string;
    stats: string;
    visual: string;
  };
  revealed: boolean;
  selectedCategory: string | null;
  onSelectCategory?: (category: string) => void;
}

const categoryConfig = {
  geography: { icon: Globe, label: 'Geography', description: 'Location & context' },
  history: { icon: Clock, label: 'History', description: 'Timeline & events' },
  culture: { icon: Sparkles, label: 'Culture', description: 'Traditions & relevance' },
  stats: { icon: BarChart3, label: 'Stats', description: 'Facts & numbers' },
  visual: { icon: Eye, label: 'Visual', description: 'Appearance & form' },
};

export default function CategoryPicker({
  categories,
  revealed,
  selectedCategory,
  onSelectCategory,
}: CategoryPickerProps) {
  if (!revealed && !onSelectCategory) return null;

  if (!revealed && onSelectCategory) {
    return (
      <div className="space-y-4 sm:space-y-8 py-4 sm:py-8 animate-fold-open">
        <div className="text-center space-y-1 sm:space-y-2">
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-forest-800">
            Choose Your First Clue
          </h2>
          <p className="text-xs sm:text-sm text-forest-600">
            Pick one category to reveal
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => onSelectCategory(key)}
                className="group relative bg-paper-cream rounded-lg sm:rounded-xl p-2 sm:p-4 secret-note-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-105 paper-texture border-2 border-forest-300/20"
              >

                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold-100" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-forest-800">{config.label}</span>
                  <span className="text-[10px] sm:text-xs text-forest-600">{config.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (selectedCategory && categories[selectedCategory as keyof typeof categories]) {
    const config = categoryConfig[selectedCategory as keyof typeof categoryConfig];
    const Icon = config.icon;

    return (
      <div className="space-y-3 sm:space-y-6 animate-paper-unfold">
        <div className="text-center space-y-1 sm:space-y-2">
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-forest-800">
            The First Clue is Revealed
          </h2>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-forest-200/40 to-gold-200/30 rounded-xl sm:rounded-2xl blur-xl" />

          <div className="relative bg-paper-cream rounded-xl sm:rounded-2xl p-4 sm:p-8 secret-note-shadow paper-texture border-2 border-forest-300/20">
            <div className="fold-crease absolute top-0 bottom-0 left-1/3 w-px" />

            <div className="flex items-start gap-3 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-lg">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-gold-100" />
                </div>
              </div>
              <div className="flex-1 pt-1 sm:pt-3">
                <p className="text-sm sm:text-lg text-forest-800 leading-relaxed font-medium">
                  {categories[selectedCategory as keyof typeof categories]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
