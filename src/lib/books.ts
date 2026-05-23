import fs from "fs";
import path from "path";

export type BookMeta = {
  slug: string;
  title: string;
  author: string;
  year: number;
  description: string;
  chapterCount: number;
  translator?: string;
};

export type Chapter = {
  chapter: number;
  title: string;
  paragraphs: string[];
};

export type Explanation = {
  paragraphRange: string;
  explanation: string;
};

export type ChapterExplanations = {
  chapter: number;
  passages: Explanation[];
};

const DATA_DIR = path.join(process.cwd(), "data", "books");

export function getCatalog(): BookMeta[] {
  const filePath = path.join(DATA_DIR, "catalog.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getBook(slug: string): BookMeta | null {
  const filePath = path.join(DATA_DIR, slug, "book.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getChapter(slug: string, chapter: number): Chapter | null {
  const filePath = path.join(DATA_DIR, slug, `chapter-${chapter}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getExplanations(slug: string, chapter: number): ChapterExplanations | null {
  const filePath = path.join(DATA_DIR, slug, `chapter-${chapter}-explanations.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
