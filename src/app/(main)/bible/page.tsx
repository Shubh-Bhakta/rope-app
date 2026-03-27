"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BIBLE_BOOKS, BOOK_CHAPTERS, getTranslation, setTranslation as saveTranslation, TRANSLATIONS, fetchChapterVerses, getHighlightsForChapter, addBibleHighlight, removeBibleHighlight, type BibleHighlight } from "@/lib/store";

const HIGHLIGHT_COLORS = [
  { id: "gold", bg: "rgba(196,162,101,0.2)", border: "rgba(196,162,101,0.4)", label: "Gold" },
  { id: "green", bg: "rgba(34,139,34,0.15)", border: "rgba(34,139,34,0.35)", label: "Green" },
  { id: "blue", bg: "rgba(70,130,180,0.15)", border: "rgba(70,130,180,0.35)", label: "Blue" },
  { id: "red", bg: "rgba(178,34,34,0.15)", border: "rgba(178,34,34,0.35)", label: "Red" },
] as const;

function getHighlightStyle(color: string) {
  return HIGHLIGHT_COLORS.find(c => c.id === color) || HIGHLIGHT_COLORS[0];
}

interface VerseData {
  verse: number;
  text: string;
}

export default function BiblePage() {
  const router = useRouter();
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(1);
  const [translation, setTranslationState] = useState("kjv");
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [selectedForJournal, setSelectedForJournal] = useState<Set<number>>(new Set());

  const maxChapter = BOOK_CHAPTERS[book] || 1;

  // Load translation preference
  useEffect(() => {
    setTranslationState(getTranslation());
  }, []);

  // Fetch chapter when book/chapter/translation changes
  const loadChapter = useCallback(async () => {
    setLoading(true);
    setError("");
    setSelectedVerse(null);
    setShowColorPicker(false);
    setSelectedForJournal(new Set());

    try {
      const data = await fetchChapterVerses(book, chapter, translation);
      setVerses(data);
      setHighlights(getHighlightsForChapter(book, chapter));
    } catch {
      setError("Could not load chapter. Try a different translation.");
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [book, chapter, translation]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  function handleHighlight(verseNum: number, color: string) {
    const existing = highlights.find(h => h.verse === verseNum);
    if (existing && existing.color === color) {
      removeBibleHighlight(book, chapter, verseNum);
    } else {
      addBibleHighlight(book, chapter, verseNum, color);
    }
    setHighlights(getHighlightsForChapter(book, chapter));
    setShowColorPicker(false);
    setSelectedVerse(null);
  }

  function toggleVerseForJournal(verseNum: number) {
    setSelectedForJournal(prev => {
      const next = new Set(prev);
      if (next.has(verseNum)) next.delete(verseNum);
      else next.add(verseNum);
      return next;
    });
  }

  function sendToJournal() {
    if (selectedForJournal.size === 0) return;
    const sortedVerses = [...selectedForJournal].sort((a, b) => a - b);
    const firstVerse = sortedVerses[0];
    const lastVerse = sortedVerses[sortedVerses.length - 1];

    // Build verse reference
    let ref: string;
    if (sortedVerses.length === 1) {
      ref = `${book} ${chapter}:${firstVerse}`;
    } else if (lastVerse - firstVerse === sortedVerses.length - 1) {
      // Contiguous range
      ref = `${book} ${chapter}:${firstVerse}-${lastVerse}`;
    } else {
      ref = `${book} ${chapter}:${sortedVerses.join(",")}`;
    }

    // Build verse text
    const text = sortedVerses
      .map(v => verses.find(vd => vd.verse === v))
      .filter(Boolean)
      .map(vd => `${vd!.verse} ${vd!.text}`)
      .join(" ");

    // Store in sessionStorage for the journal page to pick up
    sessionStorage.setItem("rope_bible_to_journal", JSON.stringify({ ref, text, translation }));
    router.push("/journal");
  }

  const filteredBooks = bookSearch
    ? BIBLE_BOOKS.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()))
    : BIBLE_BOOKS;

  const otBooks = filteredBooks.slice(0, 39);
  const ntBooks = filteredBooks.slice(39);

  return (
    <div className="px-5 pt-6 pb-8" style={{ animation: "fadeIn 0.4s ease-out both" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-2xl text-brown mb-0.5">Bible</h1>
          <p className="text-muted text-sm">Read, highlight, journal</p>
        </div>
        <select
          value={translation}
          onChange={(e) => { setTranslationState(e.target.value); saveTranslation(e.target.value); }}
          className="px-2 py-1.5 bg-ivory border border-brown/10 rounded-lg text-dark text-xs focus:outline-none"
        >
          {TRANSLATIONS.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Book + Chapter selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setShowBookPicker(!showBookPicker); setBookSearch(""); }}
          className="flex-1 px-3 py-2.5 bg-ivory border border-brown/10 rounded-xl text-dark text-sm font-medium text-left truncate"
        >
          {book}
          <span className="text-muted ml-1">▾</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setChapter(c => Math.max(1, c - 1))}
            disabled={chapter <= 1}
            className="w-8 h-10 flex items-center justify-center rounded-lg border border-brown/10 text-muted hover:text-brown disabled:opacity-30 transition"
          >
            ‹
          </button>
          <span className="w-16 text-center text-sm font-medium text-dark">Ch. {chapter}</span>
          <button
            onClick={() => setChapter(c => Math.min(maxChapter, c + 1))}
            disabled={chapter >= maxChapter}
            className="w-8 h-10 flex items-center justify-center rounded-lg border border-brown/10 text-muted hover:text-brown disabled:opacity-30 transition"
          >
            ›
          </button>
        </div>
      </div>

      {/* Book picker dropdown */}
      {showBookPicker && (
        <div className="card-surface rounded-2xl p-3 mb-4 max-h-80 overflow-y-auto" style={{ animation: "fadeIn 0.2s ease-out both" }}>
          <input
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            placeholder="Search books..."
            className="w-full px-3 py-2 bg-ivory border border-brown/10 rounded-xl text-dark text-sm focus:outline-none placeholder:text-muted/50 mb-3"
            autoFocus
          />
          {otBooks.length > 0 && (
            <>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-2 font-medium">Old Testament</p>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {otBooks.map(b => (
                  <button
                    key={b.name}
                    onClick={() => { setBook(b.name); setChapter(1); setShowBookPicker(false); }}
                    className={`px-2 py-1.5 text-xs rounded-lg text-left truncate transition ${book === b.name ? "bg-brown/10 text-brown font-medium" : "text-dark hover:bg-brown/5"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {ntBooks.length > 0 && (
            <>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-2 font-medium">New Testament</p>
              <div className="grid grid-cols-3 gap-1">
                {ntBooks.map(b => (
                  <button
                    key={b.name}
                    onClick={() => { setBook(b.name); setChapter(1); setShowBookPicker(false); }}
                    className={`px-2 py-1.5 text-xs rounded-lg text-left truncate transition ${book === b.name ? "bg-brown/10 text-brown font-medium" : "text-dark hover:bg-brown/5"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Chapter quick-jump */}
      {maxChapter > 1 && (
        <div className="flex flex-wrap gap-1 mb-5">
          {Array.from({ length: maxChapter }, (_, i) => i + 1).map(ch => (
            <button
              key={ch}
              onClick={() => setChapter(ch)}
              className={`w-8 h-7 text-xs rounded-md transition ${ch === chapter ? "bg-brown text-ivory font-medium" : "text-muted hover:bg-brown/5 hover:text-brown"}`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted font-serif">Loading chapter...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-400/80 text-sm">{error}</p>
        </div>
      )}

      {/* Verses */}
      {!loading && !error && verses.length > 0 && (
        <div className="space-y-0.5 mb-6">
          {verses.map(v => {
            const highlight = highlights.find(h => h.verse === v.verse);
            const hStyle = highlight ? getHighlightStyle(highlight.color) : null;
            const isSelected = selectedVerse === v.verse;
            const isJournalSelected = selectedForJournal.has(v.verse);

            return (
              <div key={v.verse} className="relative group">
                <div
                  onClick={() => {
                    if (selectedVerse === v.verse) {
                      setSelectedVerse(null);
                      setShowColorPicker(false);
                    } else {
                      setSelectedVerse(v.verse);
                      setShowColorPicker(false);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? "ring-1 ring-brown/20" : ""} ${isJournalSelected ? "ring-2 ring-accent-gold/40" : ""}`}
                  style={hStyle ? { backgroundColor: hStyle.bg, borderLeft: `3px solid ${hStyle.border}` } : { borderLeft: "3px solid transparent" }}
                >
                  <span className="text-muted/50 text-xs font-mono mr-2 select-none">{v.verse}</span>
                  <span className="text-dark text-[15px] leading-relaxed">{v.text}</span>
                </div>

                {/* Verse action bar */}
                {isSelected && (
                  <div
                    className="flex items-center gap-1 mt-1 ml-3 mb-2"
                    style={{ animation: "fadeIn 0.15s ease-out both" }}
                  >
                    {/* Highlight button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-muted hover:text-brown bg-ivory border border-brown/10 rounded-lg transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Highlight
                    </button>

                    {/* Journal button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVerseForJournal(v.verse); }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg border transition ${isJournalSelected ? "bg-accent-gold/15 text-accent-gold border-accent-gold/20" : "text-muted hover:text-brown bg-ivory border-brown/10"}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      {isJournalSelected ? "Selected" : "Journal"}
                    </button>

                    {/* Remove highlight */}
                    {highlight && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBibleHighlight(book, chapter, v.verse); setHighlights(getHighlightsForChapter(book, chapter)); }}
                        className="px-2 py-1 text-[10px] text-muted/50 hover:text-red-400 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {/* Color picker */}
                {isSelected && showColorPicker && (
                  <div className="flex items-center gap-2 ml-3 mb-2" style={{ animation: "fadeIn 0.15s ease-out both" }}>
                    {HIGHLIGHT_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={(e) => { e.stopPropagation(); handleHighlight(v.verse, c.id); }}
                        className={`w-7 h-7 rounded-full border-2 transition hover:scale-110 ${highlight?.color === c.id ? "ring-2 ring-brown/30 ring-offset-1" : ""}`}
                        style={{ backgroundColor: c.bg, borderColor: c.border }}
                        title={c.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Send to Journal floating bar */}
      {selectedForJournal.size > 0 && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg border border-accent-gold/20"
          style={{ background: "rgba(10,8,4,0.92)", backdropFilter: "blur(12px)", animation: "fadeInUp 0.3s ease-out both" }}
        >
          <span className="text-ivory/70 text-sm">
            {selectedForJournal.size} verse{selectedForJournal.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={sendToJournal}
            className="px-4 py-2 bg-accent-gold/20 text-accent-gold text-sm font-medium rounded-xl hover:bg-accent-gold/30 transition"
          >
            Journal this →
          </button>
          <button
            onClick={() => setSelectedForJournal(new Set())}
            className="text-ivory/30 text-xs hover:text-ivory/60 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Chapter navigation */}
      {!loading && verses.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-brown/8">
          <button
            onClick={() => {
              if (chapter > 1) setChapter(c => c - 1);
              else {
                const bookIdx = BIBLE_BOOKS.findIndex(b => b.name === book);
                if (bookIdx > 0) {
                  const prevBook = BIBLE_BOOKS[bookIdx - 1].name;
                  setBook(prevBook);
                  setChapter(BOOK_CHAPTERS[prevBook] || 1);
                }
              }
              window.scrollTo(0, 0);
            }}
            disabled={chapter <= 1 && BIBLE_BOOKS.findIndex(b => b.name === book) === 0}
            className="flex items-center gap-1 text-sm text-muted hover:text-brown disabled:opacity-30 transition"
          >
            ← Previous
          </button>
          <span className="text-muted/50 text-xs">{book} {chapter}</span>
          <button
            onClick={() => {
              if (chapter < maxChapter) setChapter(c => c + 1);
              else {
                const bookIdx = BIBLE_BOOKS.findIndex(b => b.name === book);
                if (bookIdx < BIBLE_BOOKS.length - 1) {
                  setBook(BIBLE_BOOKS[bookIdx + 1].name);
                  setChapter(1);
                }
              }
              window.scrollTo(0, 0);
            }}
            disabled={chapter >= maxChapter && BIBLE_BOOKS.findIndex(b => b.name === book) === BIBLE_BOOKS.length - 1}
            className="flex items-center gap-1 text-sm text-muted hover:text-brown disabled:opacity-30 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
