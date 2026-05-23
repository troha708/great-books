const fs = require('fs');
const path = require('path');

// Read the raw text
const rawText = fs.readFileSync(path.join(__dirname, '..', 'raw-venus.txt'), 'utf-8');
const lines = rawText.split(/\r?\n/);

const SECTION_BREAK_PATTERN = /^\*\s+\*\s+\*\s+\*\s+\*/;
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'books', 'venus-in-furs');

// --- Extract Introduction (lines 56-199, 1-indexed) ---
const introLines = lines.slice(55, 199); // 0-indexed: 55 to 198

// --- Extract Story (lines 214-5758, 1-indexed) ---
// Story starts at line 214 ("My company was charming.")
// Story ends before "*** END OF THE PROJECT GUTENBERG EBOOK"
// We include footnotes at the end (up to line 5758)
const storyLines = lines.slice(213, 5758); // 0-indexed: 213 to 5757

// --- Parse paragraphs from a block of lines ---
function parseParagraphs(lineBlock) {
  const paragraphs = [];
  let currentPara = [];

  for (const line of lineBlock) {
    // Check for section break
    if (SECTION_BREAK_PATTERN.test(line)) {
      // Flush current paragraph
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
      paragraphs.push('***');
      continue;
    }

    const trimmed = line.trimEnd();

    if (trimmed === '') {
      // Blank line = paragraph break
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
    } else {
      currentPara.push(trimmed);
    }
  }

  // Flush last paragraph
  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }

  return paragraphs;
}

// --- Parse intro ---
const introParagraphs = parseParagraphs(introLines);
// Remove leading "INTRODUCTION" header from paragraphs if present
if (introParagraphs[0] === 'INTRODUCTION') {
  introParagraphs.shift();
}

// --- Parse story into sections by section breaks ---
// Split storyLines at section breaks, keeping track of sections
const sections = []; // each section is an array of lines
let currentSection = [];

for (const line of storyLines) {
  if (SECTION_BREAK_PATTERN.test(line)) {
    sections.push(currentSection);
    currentSection = [];
  } else {
    currentSection.push(line);
  }
}
// Push the last section
if (currentSection.length > 0) {
  sections.push(currentSection);
}

console.log(`Found ${sections.length} sections (${sections.length - 1} breaks)`);

// --- Group sections into ~15 chapters ---
// We have 80 sections (79 breaks + 1). We want 15 chapters.
// Strategy: use predefined breakpoints based on content analysis.
// Sections 0 and 1 are very large (~430 lines each), so they get their own chapters.
// Later sections are small (10-50 lines), so we group many together.

const sectionLineCounts = sections.map(s => s.filter(l => l.trim() !== '').length);
const totalContentLines = sectionLineCounts.reduce((a, b) => a + b, 0);

console.log(`Total content lines: ${totalContentLines}`);
for (let i = 0; i < sections.length; i++) {
  console.log(`  Section ${i}: ${sectionLineCounts[i]} content lines`);
}

// Manually define chapter boundaries as [startSection, endSection)
// to get 15 well-balanced chapters
const chapterGroupings = [
  { start: 0, end: 1 },    // Ch1: sections 0 (dream of Venus, ~303 lines)
  { start: 1, end: 2 },    // Ch2: sections 1 (the confession, ~282 lines)
  { start: 2, end: 5 },    // Ch3: sections 2-4
  { start: 5, end: 7 },    // Ch4: sections 5-6
  { start: 7, end: 12 },   // Ch5: sections 7-11
  { start: 12, end: 17 },  // Ch6: sections 12-16
  { start: 17, end: 23 },  // Ch7: sections 17-22
  { start: 23, end: 30 },  // Ch8: sections 23-29
  { start: 30, end: 34 },  // Ch9: sections 30-33
  { start: 34, end: 40 },  // Ch10: sections 34-39
  { start: 40, end: 49 },  // Ch11: sections 40-48
  { start: 49, end: 58 },  // Ch12: sections 49-57
  { start: 58, end: 68 },  // Ch13: sections 58-67
  { start: 68, end: 75 },  // Ch14: sections 68-74
  { start: 75, end: 80 },  // Ch15: sections 75-79
];

// Verify coverage
const lastEnd = chapterGroupings[chapterGroupings.length - 1].end;
if (lastEnd !== sections.length) {
  console.error(`WARNING: chapter groupings end at ${lastEnd} but there are ${sections.length} sections`);
}

// Print chapter sizes
for (let i = 0; i < chapterGroupings.length; i++) {
  const g = chapterGroupings[i];
  let count = 0;
  for (let s = g.start; s < g.end; s++) count += sectionLineCounts[s];
  console.log(`  Chapter ${i + 1}: sections ${g.start}-${g.end - 1}, ${count} content lines`);
}

console.log(`Created ${chapterGroupings.length} chapters`);

// --- Build chapter paragraphs ---
function buildChapterParagraphs(grouping) {
  const paragraphs = [];
  for (let s = grouping.start; s < grouping.end; s++) {
    // Add section break between sections (not before first)
    if (s > grouping.start) {
      paragraphs.push('***');
    }
    const sectionParas = parseParagraphs(sections[s]);
    paragraphs.push(...sectionParas);
  }
  return paragraphs;
}

// --- Chapter titles based on content ---
const chapterTitles = [
  "A Dream of Venus",
  "The Confession",
  "Venus with the Mirror",
  "The Proposition",
  "A Dangerous Experiment",
  "The Contract",
  "Journey to Italy",
  "Life in Florence",
  "The Slave's Labors",
  "Painted in Chains",
  "The Greek and the Whip",
  "A Rival Appears",
  "The Portrait Sittings",
  "Betrayal and Despair",
  "The Cure"
];

// --- Write chapter files ---
const chapterFiles = [];

// Chapter 0: Introduction
const introChapter = {
  chapter: 0,
  title: "Introduction",
  paragraphs: introParagraphs
};
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'chapter-0.json'),
  JSON.stringify(introChapter, null, 2),
  'utf-8'
);
console.log(`Wrote chapter-0.json (Introduction): ${introParagraphs.length} paragraphs`);

// Chapters 1-N
for (let i = 0; i < chapterGroupings.length; i++) {
  const chapterNum = i + 1;
  const paragraphs = buildChapterParagraphs(chapterGroupings[i]);
  const title = chapterTitles[i] || `Chapter ${chapterNum}`;

  const chapter = {
    chapter: chapterNum,
    title: title,
    paragraphs: paragraphs
  };

  const filename = `chapter-${chapterNum}.json`;
  fs.writeFileSync(
    path.join(OUTPUT_DIR, filename),
    JSON.stringify(chapter, null, 2),
    'utf-8'
  );

  const lineCount = chapterGroupings[i].end - chapterGroupings[i].start;
  console.log(`Wrote ${filename} ("${title}"): sections ${chapterGroupings[i].start}-${chapterGroupings[i].end - 1}, ${paragraphs.length} paragraphs`);
}

const totalChapters = chapterGroupings.length; // not counting intro

// --- Write book.json ---
const bookMeta = {
  slug: "venus-in-furs",
  title: "Venus in Furs",
  author: "Leopold von Sacher-Masoch",
  year: 1870,
  translator: "Fernanda Savage",
  description: "A philosophical novella exploring themes of love, power, and obsession through the story of Severin von Kusiemski and the object of his desire, Wanda von Dunajew.",
  chapterCount: totalChapters
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'book.json'),
  JSON.stringify(bookMeta, null, 2),
  'utf-8'
);
console.log(`\nWrote book.json with chapterCount: ${totalChapters}`);

// --- Write catalog.json ---
const catalog = [
  {
    slug: "venus-in-furs",
    title: "Venus in Furs",
    author: "Leopold von Sacher-Masoch",
    year: 1870,
    description: "A philosophical novella exploring themes of love, power, and obsession.",
    chapterCount: totalChapters
  }
];

const catalogDir = path.join(__dirname, '..', 'data', 'books');
fs.writeFileSync(
  path.join(catalogDir, 'catalog.json'),
  JSON.stringify(catalog, null, 2),
  'utf-8'
);
console.log(`Wrote catalog.json`);

console.log('\nDone!');
