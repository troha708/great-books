"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import type { BookMeta, Chapter, ChapterExplanations } from "@/lib/books";

type Props = {
  book: BookMeta;
  chapter: Chapter;
  explanations: ChapterExplanations | null;
  currentChapter: number;
};

function renderParagraph(text: string) {
  // Handle italic markers: _text_
  const parts = text.split(/(_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function ChapterReader({ book, chapter, explanations, currentChapter }: Props) {
  const { theme, toggle } = useTheme();
  const [fontSize, setFontSize] = useState(18);
  const [openExplanation, setOpenExplanation] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("gb-font-size");
    if (stored) setFontSize(parseInt(stored, 10));
  }, []);

  const changeFontSize = useCallback((delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(28, Math.max(14, prev + delta));
      localStorage.setItem("gb-font-size", String(next));
      return next;
    });
  }, []);

  const hasPrev = currentChapter > 1;
  const hasNext = currentChapter < book.chapterCount;

  // Build explanation map: paragraph index -> explanation
  const explanationMap = new Map<number, { explanation: string; rangeLabel: string }>();
  if (explanations?.passages) {
    for (const passage of explanations.passages) {
      const range = passage.paragraphRange;
      const [startStr] = range.split("-");
      const start = parseInt(startStr, 10);
      // Attach explanation to the last paragraph in range
      const endStr = range.includes("-") ? range.split("-")[1] : startStr;
      const end = parseInt(endStr, 10);
      explanationMap.set(end, {
        explanation: passage.explanation,
        rangeLabel: range,
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-warm-200 bg-warm-50/95 backdrop-blur supports-[backdrop-filter]:bg-warm-50/80 dark:border-warm-800 dark:bg-warm-900/95 dark:supports-[backdrop-filter]:bg-warm-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/library`}
              className="text-sm text-warm-400 hover:text-warm-600 dark:text-warm-500 dark:hover:text-warm-300 transition-colors shrink-0"
            >
              &larr;
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-warm-800 dark:text-warm-100 truncate">
                {book.title}
              </h1>
              <p className="text-xs text-warm-400 dark:text-warm-500 truncate">
                {chapter.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => changeFontSize(-2)}
              className="rounded-md px-2 py-1 text-xs text-warm-500 hover:bg-warm-200 dark:text-warm-400 dark:hover:bg-warm-700 transition-colors"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <button
              onClick={() => changeFontSize(2)}
              className="rounded-md px-2 py-1 text-sm text-warm-500 hover:bg-warm-200 dark:text-warm-400 dark:hover:bg-warm-700 transition-colors"
              aria-label="Increase font size"
            >
              A+
            </button>
            <button
              onClick={toggle}
              className="rounded-md px-2 py-1 text-sm text-warm-500 hover:bg-warm-200 dark:text-warm-400 dark:hover:bg-warm-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Chapter navigation strip */}
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pb-2">
          <div className="flex gap-1 overflow-x-auto">
            {Array.from({ length: book.chapterCount }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/read/${book.slug}/${n}`}
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  n === currentChapter
                    ? "bg-warm-800 text-warm-50 dark:bg-warm-200 dark:text-warm-900"
                    : "text-warm-400 hover:bg-warm-200 dark:text-warm-500 dark:hover:bg-warm-700"
                }`}
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Chapter content */}
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-2xl font-bold text-warm-800 dark:text-warm-100 text-center">
            {chapter.title}
          </h2>

          <div className="prose-reading" style={{ fontSize: `${fontSize}px` }}>
            {chapter.paragraphs.map((para, idx) => {
              const pIdx = idx + 1;

              if (para === "***") {
                return (
                  <div
                    key={idx}
                    className="my-8 text-center text-warm-300 dark:text-warm-600 tracking-[0.5em]"
                  >
                    ***
                  </div>
                );
              }

              const expl = explanationMap.get(pIdx);

              return (
                <div key={idx}>
                  <p className="mb-[1.2em] text-warm-800 dark:text-warm-200">
                    {renderParagraph(para)}
                    {expl && (
                      <button
                        onClick={() =>
                          setOpenExplanation(openExplanation === pIdx ? null : pIdx)
                        }
                        className="ml-1.5 inline translate-y-[-0.1em] cursor-pointer select-none text-[0.55em] text-warm-300 transition-colors hover:text-amber-500 dark:text-warm-600 dark:hover:text-amber-400"
                        aria-label={`Explanation for paragraphs ${expl.rangeLabel}`}
                      >
                        💡
                      </button>
                    )}
                  </p>

                  {expl && openExplanation === pIdx && (
                    <div className="mb-6 rounded-xl bg-warm-100/80 px-4 py-3.5 text-[0.85em] leading-relaxed text-warm-600 dark:bg-warm-800/50 dark:text-warm-400">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <span className="mb-1 mr-2 inline-block rounded-md bg-warm-200/80 px-1.5 py-0.5 text-[0.7em] font-semibold text-warm-500 dark:bg-warm-700/60 dark:text-warm-400">
                            ¶{expl.rangeLabel}
                          </span>
                          {expl.explanation}
                        </div>
                        <button
                          onClick={() => setOpenExplanation(null)}
                          className="shrink-0 rounded-md p-0.5 text-lg leading-none text-warm-400 transition-colors hover:bg-warm-200/60 hover:text-warm-600 dark:hover:bg-warm-700/40 dark:hover:text-warm-300"
                          aria-label="Close explanation"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="border-t border-warm-200 dark:border-warm-800 px-4 py-4">
        <div className="mx-auto flex max-w-2xl justify-between">
          {hasPrev ? (
            <Link
              href={`/read/${book.slug}/${currentChapter - 1}`}
              className="rounded-lg bg-warm-200 px-5 py-2.5 text-sm font-medium text-warm-700 transition hover:bg-warm-300 dark:bg-warm-700 dark:text-warm-200 dark:hover:bg-warm-600"
            >
              &larr; Previous
            </Link>
          ) : (
            <div />
          )}
          {hasNext ? (
            <Link
              href={`/read/${book.slug}/${currentChapter + 1}`}
              className="rounded-lg bg-warm-800 px-5 py-2.5 text-sm font-medium text-warm-50 transition hover:bg-warm-700 dark:bg-warm-200 dark:text-warm-900 dark:hover:bg-warm-300"
            >
              Next &rarr;
            </Link>
          ) : (
            <Link
              href="/library"
              className="rounded-lg bg-warm-800 px-5 py-2.5 text-sm font-medium text-warm-50 transition hover:bg-warm-700 dark:bg-warm-200 dark:text-warm-900 dark:hover:bg-warm-300"
            >
              Back to Library
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
