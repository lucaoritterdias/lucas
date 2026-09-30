"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

export type ArticleFilterValues = {
  q?: string;
  category?: string;
  tag?: string;
  period?: string;
  length?: string;
  sort?: string;
};

type Option = { value: string; label: string };

const COPY = {
  pt: {
    label: "Filtros de artigos",
    search: "Buscar",
    searchPlaceholder: "Título, resumo ou tag…",
    category: "Tipo",
    tag: "Tag",
    period: "Data",
    length: "Leitura",
    sort: "Ordem",
    anyCategory: "Todos os tipos",
    anyTag: "Todas as tags",
    anyDate: "Qualquer data",
    anyLength: "Qualquer duração",
    wholeYear: "Todo",
    lengths: [
      { value: "short", label: "Até 5 min" },
      { value: "medium", label: "6 a 10 min" },
      { value: "long", label: "Mais de 10 min" },
    ],
    sorts: [
      { value: "", label: "Mais recentes" },
      { value: "oldest", label: "Mais antigos" },
      { value: "shortest", label: "Leitura mais curta" },
    ],
    apply: "Aplicar",
    clear: "Limpar filtros",
    results: (shown: number, total: number) =>
      shown === total ? `${total} ${total === 1 ? "artigo" : "artigos"}` : `${shown} de ${total} artigos`,
  },
  en: {
    label: "Article filters",
    search: "Search",
    searchPlaceholder: "Title, summary or tag…",
    category: "Type",
    tag: "Tag",
    period: "Date",
    length: "Reading",
    sort: "Order",
    anyCategory: "All types",
    anyTag: "All tags",
    anyDate: "Any date",
    anyLength: "Any length",
    wholeYear: "All of",
    lengths: [
      { value: "short", label: "Up to 5 min" },
      { value: "medium", label: "6 to 10 min" },
      { value: "long", label: "Over 10 min" },
    ],
    sorts: [
      { value: "", label: "Newest first" },
      { value: "oldest", label: "Oldest first" },
      { value: "shortest", label: "Shortest read" },
    ],
    apply: "Apply",
    clear: "Clear filters",
    results: (shown: number, total: number) =>
      shown === total ? `${total} ${total === 1 ? "article" : "articles"}` : `${shown} of ${total} articles`,
  },
};

export function ArticleFilters({
  locale,
  values,
  categories,
  tags,
  periods,
  shown,
  total,
}: {
  locale: "pt" | "en";
  values: ArticleFilterValues;
  categories: string[];
  tags: string[];
  /** year → months ("YYYY-MM" + label), newest first */
  periods: { year: string; months: Option[] }[];
  shown: number;
  total: number;
}) {
  const t = COPY[locale];
  const router = useRouter();
  const pathname = usePathname();
  const form = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(values.q ?? "");
  const active = Object.values(values).some(Boolean);

  const apply = () => {
    if (!form.current) return;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form.current)) {
      const text = String(value).trim();
      if (text) params.set(key, text);
    }
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  // Typing filters after a short pause instead of on every keystroke.
  useEffect(() => {
    if (query === (values.q ?? "")) return;
    const timer = setTimeout(apply, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply();
  };

  return (
    <form ref={form} className="article-filters" role="search" aria-label={t.label} method="get" action={pathname} onSubmit={submit}>
      {/* one bar: search, then the selects; labels stay for screen readers, the first option names each filter */}
      <div className="article-filterbar">
      <label className="filter-field filter-search">
        <span>{t.search}</span>
        <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input type="search" name="q" value={query} placeholder={t.searchPlaceholder} onChange={(event) => setQuery(event.target.value)} />
      </label>

      <label className="filter-field">
        <span>{t.category}</span>
        <select name="category" defaultValue={values.category ?? ""} onChange={apply} key={`c-${values.category}`}>
          <option value="">{t.anyCategory}</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>{t.tag}</span>
        <select name="tag" defaultValue={values.tag ?? ""} onChange={apply} key={`t-${values.tag}`}>
          <option value="">{t.anyTag}</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>#{tag}</option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>{t.period}</span>
        <select name="period" defaultValue={values.period ?? ""} onChange={apply} key={`p-${values.period}`}>
          <option value="">{t.anyDate}</option>
          {periods.map(({ year, months }) => (
            <optgroup key={year} label={year}>
              <option value={year}>{t.wholeYear} {year}</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>{t.length}</span>
        <select name="length" defaultValue={values.length ?? ""} onChange={apply} key={`l-${values.length}`}>
          <option value="">{t.anyLength}</option>
          {t.lengths.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="filter-field filter-sort">
        <span>{t.sort}</span>
        <select name="sort" defaultValue={values.sort ?? ""} onChange={apply} key={`s-${values.sort}`}>
          {t.sorts.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      </div>

      <div className="filter-summary">
        <span aria-live="polite">{t.results(shown, total)}</span>
        {active && (
          <Link href={pathname} scroll={false} onClick={() => setQuery("")}>
            {t.clear}
          </Link>
        )}
        <noscript>
          <button type="submit">{t.apply}</button>
        </noscript>
      </div>
    </form>
  );
}
