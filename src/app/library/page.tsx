import Link from "next/link";
import { getCatalog } from "@/lib/books";

export const metadata = {
  title: "Library — Great Books",
};

export default function LibraryPage() {
  const catalog = getCatalog();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-warm-400 hover:text-warm-600 dark:text-warm-500 dark:hover:text-warm-300 transition-colors"
        >
          &larr; Home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-warm-800 dark:text-warm-100">
          Library
        </h1>
        <p className="mt-2 text-warm-500 dark:text-warm-400">
          Choose a book to start reading with guided explanations.
        </p>

        <div className="mt-10 space-y-6">
          {catalog.map((book) => (
            <Link
              key={book.slug}
              href={`/read/${book.slug}/1`}
              className="block rounded-xl border border-warm-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-warm-300 dark:border-warm-700 dark:bg-warm-800 dark:hover:border-warm-600"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-warm-800 dark:text-warm-100">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-sm text-warm-500 dark:text-warm-400">
                    {book.author} &middot; {book.year}
                  </p>
                  <p className="mt-3 text-sm text-warm-600 dark:text-warm-300">
                    {book.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-warm-100 px-2.5 py-1 text-xs font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-300">
                  {book.chapterCount} chapters
                </span>
              </div>
            </Link>
          ))}

          {catalog.length === 0 && (
            <p className="text-warm-400 dark:text-warm-500 italic">
              No books available yet. Check back soon.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
