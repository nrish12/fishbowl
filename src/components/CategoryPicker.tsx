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
      <div className="space-y-6 animate-fold-open">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1 bg-forest-100 border border-forest-300/30 rounded-full mb-2">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 1</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-forest-800">
            Choose Your First Fold
          </h2>
          <p className="text-sm text-forest-600">
            Pick one category to reveal
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => onSelectCategory(key)}
                className="group relative bg-paper-cream rounded-xl p-4 secret-note-shadow hover:shadow-xl transition-all duration-300 transform hover:scale-105 paper-texture border-2 border-forest-300/20"
              >

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Icon size={20} className="text-gold-100" />
                  </div>
                  <span className="text-sm font-bold text-forest-800">{config.label}</span>
                  <span className="text-xs text-forest-600">{config.description}</span>
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
      <div className="space-y-6 animate-paper-unfold">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1 bg-forest-100 border border-forest-300/30 rounded-full mb-2">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 1 • {config.label}</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-forest-800">
            The First Fold Opens
          </h2>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-br from-forest-200/40 to-gold-200/30 rounded-2xl blur-xl" />

          <div className="relative bg-paper-cream rounded-2xl p-8 secret-note-shadow paper-texture border-2 border-forest-300/20">
            <div className="fold-crease absolute top-0 bottom-0 left-1/3 w-px" />

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center shadow-lg">
                  <Icon size={28} className="text-gold-100" />
                </div>
              </div>
              <div className="flex-1 pt-3">
                <p className="text-lg text-forest-800 leading-relaxed font-medium">
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
