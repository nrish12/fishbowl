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
      <div className="space-y-5 animate-[unfoldNote_0.6s_ease-out]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-serif font-bold text-forest/90">
            Peek at the First Clue
          </h2>
          <p className="text-sm text-forest/60">
            Choose one category to unfold
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => onSelectCategory(key)}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-white to-cream border-2 border-neutral-200 rounded-xl hover:border-gold hover:shadow-lg hover:scale-105 transition-all duration-200 group"
              >
                <Icon size={24} className="text-forest/60 group-hover:text-gold transition-colors" />
                <span className="text-sm font-semibold text-forest">{config.label}</span>
                <span className="text-xs text-forest/50">{config.description}</span>
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
      <div className="space-y-5 animate-[unfoldNote_0.6s_ease-out]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-serif font-bold text-forest/90">
            The First Fold Opens
          </h2>
          <p className="text-sm text-forest/60">{config.label} clue revealed</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-yellow-100/30 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-white to-cream border-2 border-gold/40 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-lg text-forest leading-relaxed font-medium flex-1 pt-2">
                {categories[selectedCategory as keyof typeof categories]}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
