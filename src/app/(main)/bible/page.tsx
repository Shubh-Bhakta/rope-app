"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  BIBLE_BOOKS, 
  BOOK_CHAPTERS, 
  getTranslation, 
  setTranslation as saveTranslation, 
  TRANSLATIONS, 
  fetchChapterVerses, 
  getHighlightsForChapter, 
  addBibleHighlight, 
  removeBibleHighlight, 
  getBibleHistory,
  updateBibleHistory,
  type BibleHighlight 
} from "@/lib/store";

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

function BibleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlBook = searchParams.get("b");
  const urlChapter = parseInt(searchParams.get("c") || "1");

  const [book, setBook] = useState(urlBook || "John");
  const [chapter, setChapter] = useState(urlChapter || 1);
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
  const [history, setHistory] = useState<any[]>([]);

  const maxChapter = BOOK_CHAPTERS[book] || 1;

  // Sync state with URL params
  useEffect(() => {
    if (urlBook && urlBook !== book) {
      setBook(urlBook);
      setChapter(urlChapter || 1);
    } else if (urlChapter && urlChapter !== chapter) {
      setChapter(urlChapter);
    }
  }, [urlBook, urlChapter]);

  // Load initial translation preference and history
  useEffect(() => {
    setTranslationState(getTranslation());
    setHistory(getBibleHistory());
  }, []);

  // Sync URL when state changes
  const syncUrl = useCallback((newBook: string, newChapter: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("b", newBook);
    params.set("c", newChapter.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

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
      updateBibleHistory(book, chapter);
      setHistory(getBibleHistory());
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

  function changePassage(newBook: string, newChapter: number) {
    setBook(newBook);
    setChapter(newChapter);
    syncUrl(newBook, newChapter);
    setShowBookPicker(false);
  }

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

      {/* History / Pick up where you left off */}
      {history.length > 0 && !showBookPicker && (
        <div className="mb-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {history.map((h, i) => (
              <button
                key={`${h.book}-${h.chapter}-${i}`}
                onClick={() => changePassage(h.book, h.chapter)}
                className={`flex flex-col items-start px-3 py-2 rounded-xl border transition-all whitespace-nowrap min-w-[120px] ${h.book === book && h.chapter === chapter ? "border-brown bg-brown/5" : "border-brown/10 bg-ivory hover:bg-brown/5"}`}
              >
                <span className="text-[10px] text-muted uppercase tracking-wider mb-0.5">{i === 0 ? "Last Read" : "Recent"}</span>
                <span className="text-xs font-medium text-brown">{h.book} {h.chapter}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Book + Chapter selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setShowBookPicker(!showBookPicker); setBookSearch(""); }}
          className="flex-1 px-3 py-2.5 bg-ivory border border-brown/10 rounded-xl text-dark text-sm font-medium text-left truncate flex items-center justify-between"
        >
          <span>{book}</span>
          <span className="text-muted text-xs">▾</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changePassage(book, Math.max(1, chapter - 1))}
            disabled={chapter <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-brown/10 text-muted hover:text-brown disabled:opacity-30 transition bg-ivory"
          >
            ‹
          </button>
          <span className="px-3 py-2.5 bg-ivory border border-brown/10 rounded-xl text-sm font-medium text-dark min-w-[64px] text-center">Ch. {chapter}</span>
          <button
            onClick={() => changePassage(book, Math.min(maxChapter, chapter + 1))}
            disabled={chapter >= maxChapter}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-brown/10 text-muted hover:text-brown disabled:opacity-30 transition bg-ivory"
          >
            ›
          </button>
        </div>
      </div>

      {/* Book picker dropdown */}
      {showBookPicker && (
        <div className="card-surface rounded-2xl p-4 mb-4 max-h-[70vh] overflow-y-auto z-30" style={{ animation: "fadeIn 0.2s ease-out both" }}>
          <input
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            placeholder="Search books..."
            className="w-full px-4 py-3 bg-ivory border border-brown/10 rounded-xl text-dark text-sm focus:outline-none placeholder:text-muted/50 mb-4"
            autoFocus
          />
          {otBooks.length > 0 && (
            <>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-3 font-medium pl-1">Old Testament</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {otBooks.map(b => (
                  <button
                    key={b.name}
                    onClick={() => changePassage(b.name, 1)}
                    className={`px-3 py-2 text-xs rounded-lg text-left truncate transition ${book === b.name ? "bg-brown text-ivory font-medium" : "text-dark bg-ivory border border-brown/5 hover:bg-brown/5"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {ntBooks.length > 0 && (
            <>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-3 font-medium pl-1">New Testament</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ntBooks.map(b => (
                  <button
                    key={b.name}
                    onClick={() => changePassage(b.name, 1)}
                    className={`px-3 py-2 text-xs rounded-lg text-left truncate transition ${book === b.name ? "bg-brown text-ivory font-medium" : "text-dark bg-ivory border border-brown/5 hover:bg-brown/5"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Chapter quick-jump (Refactored for touch) */}
      {maxChapter > 1 && !showBookPicker && (
        <div className="flex flex-wrap gap-2 mb-6 p-1">
          {Array.from({ length: maxChapter }, (_, i) => i + 1).map(ch => (
            <button
              key={ch}
              onClick={() => changePassage(book, ch)}
              className={`min-w-[40px] h-10 text-xs rounded-xl transition ${ch === chapter ? "bg-brown text-ivory font-medium shadow-md shadow-brown/20" : "text-muted bg-ivory border border-brown/10 hover:border-brown/30 hover:text-brown"}`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      {/* Loading / Error */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-brown/20 border-t-brown rounded-full animate-spin" />
          <p className="text-muted font-serif italic text-sm">Opening the scroll...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-12 px-6 bg-red-400/5 rounded-2xl border border-red-400/10">
          <p className="text-red-400/80 text-sm mb-4">{error}</p>
          <button onClick={loadChapter} className="text-xs text-red-500 font-medium underline underline-offset-4">Try again</button>
        </div>
      )}

      {/* Verses */}
      {!loading && !error && verses.length > 0 && (
        <div className="space-y-0.5 mb-8">
          {verses.map(v => {
            const highlight = highlights.find(h => h.verse === v.verse);
            const hStyle = highlight ? getHighlightStyle(highlight.color) : null;
            const isSelected = selectedVerse === v.verse;
            const isJournalSelected = selectedForJournal.has(v.verse);

            return (
              <div key={v.verse} className="relative">
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
                  className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? "bg-cream-dark/30 ring-1 ring-brown/10 shadow-sm" : "hover:bg-cream/30"} ${isJournalSelected ? "bg-accent-gold/10 ring-2 ring-accent-gold/40 shadow-sm" : ""}`}
                  style={hStyle ? { backgroundColor: hStyle.bg, borderLeft: `4px solid ${hStyle.border}` } : { borderLeft: "4px solid transparent" }}
                >
                  <span className="text-muted/30 text-[10px] font-mono mr-3 select-none inline-block w-4">{v.verse}</span>
                  <span className="text-dark text-[15px] leading-relaxed tracking-wide">{v.text}</span>
                </div>

                {/* Verse action bar */}
                {isSelected && (
                  <div
                    className="flex items-center gap-1.5 mt-2 ml-4 mb-3"
                    style={{ animation: "fadeIn 0.2s ease-out both" }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-muted hover:text-brown bg-ivory border border-brown/10 rounded-xl transition shadow-sm"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Highlight
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVerseForJournal(v.verse); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-xl border transition shadow-sm ${isJournalSelected ? "bg-accent-gold/20 text-accent-gold border-accent-gold/40" : "text-muted hover:text-brown bg-ivory border-brown/10"}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      {isJournalSelected ? "Selected" : "Journal"}
                    </button>

                    {highlight && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBibleHighlight(book, chapter, v.verse); setHighlights(getHighlightsForChapter(book, chapter)); }}
                        className="px-2 py-1.5 text-[10px] font-medium text-red-400 hover:text-red-500 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {/* Color picker */}
                {isSelected && showColorPicker && (
                  <div className="flex items-center gap-3 ml-4 mb-3" style={{ animation: "fadeIn 0.2s ease-out both" }}>
                    {HIGHLIGHT_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={(e) => { e.stopPropagation(); handleHighlight(v.verse, c.id); }}
                        className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${highlight?.color === c.id ? "ring-2 ring-brown/30 ring-offset-2" : ""}`}
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
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-4 rounded-3xl shadow-xl border border-accent-gold/20"
          style={{ background: "rgba(10,8,4,0.94)", backdropFilter: "blur(16px)", animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <div className="flex flex-col">
            <span className="text-ivory font-bold text-sm leading-none">{selectedForJournal.size}</span>
            <span className="text-ivory/40 text-[10px] uppercase tracking-tighter">Selected</span>
          </div>
          <div className="w-px h-6 bg-ivory/10" />
          <button
            onClick={sendToJournal}
            className="px-5 py-2.5 bg-accent-gold text-dark-brown text-sm font-bold rounded-2xl hover:bg-accent-gold/90 active:scale-95 transition-all"
          >
            Journal →
          </button>
          <button
            onClick={() => setSelectedForJournal(new Set())}
            className="text-ivory/30 text-xs hover:text-ivory transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Chapter navigation footer */}
      {!loading && verses.length > 0 && (
        <div className="flex items-center justify-between pt-8 border-t border-brown/8 mt-4">
          <button
            onClick={() => {
              if (chapter > 1) changePassage(book, chapter - 1);
              else {
                const bookIdx = BIBLE_BOOKS.findIndex(b => b.name === book);
                if (bookIdx > 0) {
                  const prevBook = BIBLE_BOOKS[bookIdx - 1].name;
                  changePassage(prevBook, BOOK_CHAPTERS[prevBook] || 1);
                }
              }
              window.scrollTo(0, 0);
            }}
            disabled={chapter <= 1 && BIBLE_BOOKS.findIndex(b => b.name === book) === 0}
            className="group flex flex-col items-start gap-1 text-muted hover:text-brown disabled:opacity-20 transition"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Previous</span>
            <span className="text-xs group-hover:-translate-x-1 transition-transform">← Chapter {chapter > 1 ? chapter - 1 : "Back"}</span>
          </button>
          <div className="flex flex-col items-center">
            <div className="w-1 h-1 bg-brown/20 rounded-full mb-1" />
            <span className="text-muted/40 text-[10px] font-serif italic">{book} {chapter}</span>
          </div>
          <button
            onClick={() => {
              if (chapter < maxChapter) changePassage(book, chapter + 1);
              else {
                const bookIdx = BIBLE_BOOKS.findIndex(b => b.name === book);
                if (bookIdx < BIBLE_BOOKS.length - 1) {
                  changePassage(BIBLE_BOOKS[bookIdx + 1].name, 1);
                }
              }
              window.scrollTo(0, 0);
            }}
            disabled={chapter >= maxChapter && BIBLE_BOOKS.findIndex(b => b.name === book) === BIBLE_BOOKS.length - 1}
            className="group flex flex-col items-end gap-1 text-muted hover:text-brown disabled:opacity-20 transition"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Continue</span>
            <span className="text-xs group-hover:translate-x-1 transition-transform">Chapter {chapter < maxChapter ? chapter + 1 : "Next"} →</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function BiblePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-serif text-muted">Loading Bible...</div>}>
      <BibleContent />
    </Suspense>
  );
}
