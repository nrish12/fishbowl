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
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-neutral-700">
            Choose your lens.
          </h2>
          <p className="text-sm text-neutral-600">
            Pick one category for your final clue
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => onSelectCategory(key)}
                className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-gold hover:shadow-md transition-all duration-200 group"
              >
                <Icon size={24} className="text-neutral-600 group-hover:text-gold transition-colors" />
                <span className="text-sm font-medium text-neutral-900">{config.label}</span>
                <span className="text-xs text-neutral-500">{config.description}</span>
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
      <div className="space-y-3 animate-[fadeIn_0.3s_ease-in-out]">
        <h2 className="text-lg font-semibold text-neutral-700 text-center">
          {config.label} revealed.
        </h2>
        <div className="bg-white border-2 border-gold/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Icon size={24} className="text-gold flex-shrink-0 mt-1" />
            <p className="text-lg text-neutral-900 leading-relaxed">
              {categories[selectedCategory as keyof typeof categories]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
