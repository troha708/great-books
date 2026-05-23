import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-warm-800 dark:text-warm-100">
          Great Books
        </h1>
        <p className="mt-4 max-w-xl text-lg text-warm-500 dark:text-warm-400">
          Read classic literature with passage-by-passage explanations that make
          every page accessible. No prior knowledge needed.
        </p>
        <Link
          href="/library"
          className="mt-8 inline-block rounded-lg bg-warm-800 px-8 py-3.5 text-sm font-semibold text-warm-50 shadow-sm transition hover:bg-warm-700 dark:bg-warm-200 dark:text-warm-900 dark:hover:bg-warm-300"
        >
          Browse the Library
        </Link>
      </section>

      {/* Features */}
      <section className="border-t border-warm-200 dark:border-warm-800 px-6 py-16">
        <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-warm-800 dark:text-warm-200">
              Guided Reading
            </h3>
            <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">
              Every passage has an inline explanation so you never feel lost.
              Literary references, historical context, and character
              motivations — all explained as you read.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-warm-800 dark:text-warm-200">
              Comfortable Reading
            </h3>
            <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">
              Dark mode, adjustable font size, and a clean layout designed for
              long reading sessions. Pick up where you left off.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-warm-800 dark:text-warm-200">
              Classic Literature
            </h3>
            <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">
              Public domain masterworks — the novels, novellas, and stories that
              shaped modern literature. Free to read, forever.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-200 dark:border-warm-800 px-6 py-6 text-center text-xs text-warm-400 dark:text-warm-600">
        Great Books — Classic literature made accessible.
      </footer>
    </main>
  );
}
