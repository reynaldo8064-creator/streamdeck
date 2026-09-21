import { Category } from "@/backend";
import type { CategoryFilter } from "@/lib/types";

export interface CategoryMeta {
  value: CategoryFilter;
  label: string;
}

/** Ordered category chips shown in the Browse filter row. */
export const CATEGORY_FILTERS: CategoryMeta[] = [
  { value: "all", label: "Todos" },
  { value: Category.news, label: "Noticias" },
  { value: Category.sports, label: "Deportes" },
  { value: Category.movies, label: "Cine" },
  { value: Category.kids, label: "Infantil" },
  { value: Category.music, label: "Música" },
  { value: Category.documentary, label: "Documentales" },
];

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.news]: "Noticias",
  [Category.sports]: "Deportes",
  [Category.movies]: "Cine",
  [Category.kids]: "Infantil",
  [Category.music]: "Música",
  [Category.documentary]: "Documentales",
};

/** Spanish display label for a backend category value. */
export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] ?? category;
}
