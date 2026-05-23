import { notFound } from "next/navigation";
import { getBook, getChapter, getExplanations } from "@/lib/books";
import { ChapterReader } from "./chapter-reader";

type Props = {
  params: Promise<{ slug: string; chapter: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, chapter: chapterStr } = await params;
  const book = getBook(slug);
  const chapter = getChapter(slug, parseInt(chapterStr, 10));
  if (!book || !chapter) return { title: "Not Found" };
  return {
    title: `${chapter.title} — ${book.title} — Great Books`,
  };
}

export default async function ReadPage({ params }: Props) {
  const { slug, chapter: chapterStr } = await params;
  const chapterNum = parseInt(chapterStr, 10);

  const book = getBook(slug);
  const chapter = getChapter(slug, chapterNum);
  if (!book || !chapter) notFound();

  const explanations = getExplanations(slug, chapterNum);

  return (
    <ChapterReader
      book={book}
      chapter={chapter}
      explanations={explanations}
      currentChapter={chapterNum}
    />
  );
}
