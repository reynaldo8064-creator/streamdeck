import { CATEGORY_FILTERS } from "@/lib/categories";
import type { CategoryFilter as CategoryFilterValue } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  className?: string;
}

/**
 * Horizontal pill row of category filters. Active chip is solid vermilion;
 * the rest are muted and outlined.
 */
export function CategoryFilter({
  value,
  onChange,
  className,
}: CategoryFilterProps) {
  return (
    <fieldset
      data-ocid="browse.filter.tab"
      className={cn(
        "-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <legend className="sr-only">Filtrar por categoría</legend>
      {CATEGORY_FILTERS.map((filter) => {
        const isActive = filter.value === value;
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(filter.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-tally"
                : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </fieldset>
  );
}
