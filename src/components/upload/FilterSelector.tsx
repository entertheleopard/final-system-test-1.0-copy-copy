import { PHOTO_FILTERS } from '@/types/upload';
import { handleImageError } from '@/lib/utils';

interface FilterSelectorProps {
  currentFilter?: string;
  onFilterChange: (filter: string) => void;
  previewUrl: string;
}

export default function FilterSelector({ currentFilter, onFilterChange, previewUrl }: FilterSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-body-sm font-medium text-foreground">Choose a filter</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {PHOTO_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.filter === 'none' ? undefined : filter.filter)}
            className="flex-shrink-0 text-center"
          >
            <div
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                (currentFilter === filter.filter || (!currentFilter && filter.filter === 'none'))
                  ? 'border-primary'
                  : 'border-border'
              }`}
            >
              <img
                src={previewUrl}
                alt={filter.name}
                className="w-full h-full object-cover"
                style={{ filter: filter.filter === 'none' ? 'none' : filter.filter }}
                onError={handleImageError}
              />
            </div>
            <p className="text-caption text-foreground mt-1">{filter.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
