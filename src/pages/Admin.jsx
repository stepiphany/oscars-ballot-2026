import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, CATEGORIES } from '../lib/api';
import { EditIcon } from '../components/Icons';

export default function Admin() {
  const { code } = useParams();
  const [results, setResults] = useState({});
  const [selected, setSelected] = useState({});
  const [saving, setSaving] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    const resRaw = api.getResults?.();
    const res = resRaw?.then ? await resRaw : (resRaw ?? {});
    setResults(typeof res === 'object' ? res : {});
  }

  async function saveCategoryAndCollapse(cat) {
    setSaving(true);
    try {
      const winnerId = selected[cat.id] ?? results[cat.id]?.winnerId ?? null;
      await api.setResult(cat.id, winnerId);
      const announcedAt = new Date().toISOString();
      setResults((prev) => ({
        ...prev,
        [cat.id]: { winnerId, announcedAt },
      }));
      setSelected((prev) => ({ ...prev, [cat.id]: undefined }));
      setExpandedCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function clearAll() {
    if (!window.confirm('Clear all saved winners? This cannot be undone.')) return;
    setSaving(true);
    try {
      await api.clearAllResults?.();
      setResults({});
      setSelected({});
      setExpandedCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <main className={`flex-1 min-h-0 overflow-y-auto px-6 py-6 max-w-lg mx-auto w-full ${code ? 'pb-20' : 'pb-6'}`}>
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-white text-sm">
            Select the winner for each category as awards are announced.
          </p>
          {Object.keys(results).length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              disabled={saving}
              className="-my-1 self-start text-red-400 text-sm font-medium hover:text-red-300 hover:underline disabled:opacity-50"
            >
              Clear all saved
            </button>
          )}
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full min-h-[44px] mb-4 pl-4 pr-4 py-2.5 text-base bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 shadow-lg"
          aria-label="Search categories"
        />

        <div className="space-y-4">
          {(() => {
            const q = searchQuery.trim().toLowerCase();
            const filtered = q
              ? CATEGORIES.filter(
                  (cat) =>
                    cat.name.toLowerCase().includes(q) ||
                    cat.nominees.some((n) => n.name.toLowerCase().includes(q))
                )
              : CATEGORIES;
            return filtered.map((cat) => {
            const savedWinnerId = results[cat.id]?.winnerId;
            const hasSavedWinner = savedWinnerId && typeof savedWinnerId === 'string' && savedWinnerId.length > 0;
            const winner = hasSavedWinner ? results[cat.id] : null;
            const winnerNom = winner
              ? cat.nominees.find((n) => n.id === winner.winnerId)
              : null;
            const isExpanded = expandedCategory === cat.id;
            const showCollapsed = winner && !isExpanded;
            const currentValue = (selected[cat.id] ?? (hasSavedWinner ? savedWinnerId : null)) || null;

            return (
              <section
                key={cat.id}
                className="bg-white/85 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg"
                aria-labelledby={`admin-cat-${cat.id}`}
              >
                {showCollapsed ? (
                  <div
                    className="cursor-pointer hover:bg-[var(--card-divider)]/10 transition-colors"
                    onClick={() => setExpandedCategory(cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedCategory(cat.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[var(--card-divider)]">
                      <h2 id={`admin-cat-${cat.id}`} className="card-title text-[var(--card-text-dark)] leading-tight">
                        {cat.name}
                      </h2>
                    </div>
                    <div className="px-5 py-4 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--card-text-dark)] min-w-0 flex-1 truncate">
                        {winnerNom?.name ?? winner.winnerId}
                      </p>
                      <span className="text-xs text-[var(--success)] font-medium shrink-0">Saved</span>
                      <EditIcon className="w-4 h-4 text-[var(--accent-on-light)] shrink-0" aria-hidden />
                      <span className="sr-only">Tap to edit</span>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[var(--card-divider)]">
                  <h2 id={`admin-cat-${cat.id}`} className="card-title text-[var(--card-text-dark)] leading-tight">
                    {cat.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => saveCategoryAndCollapse(cat)}
                    disabled={saving || !currentValue}
                    className="shrink-0 px-4 py-2 rounded-lg bg-[var(--btn-bg)] text-white text-sm font-semibold hover:bg-[var(--btn-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : winner ? 'Update Winner' : 'Save Winner'}
                  </button>
                </div>
                  <div className="divide-y divide-[var(--card-divider)]" role="radiogroup" aria-labelledby={`admin-cat-${cat.id}`}>
                    {cat.nominees.map((nom) => (
                      <label
                        key={nom.id}
                        className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${
                          currentValue === nom.id
                            ? 'bg-[var(--card-divider)]/30'
                            : 'hover:bg-[var(--card-divider)]/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name={cat.id}
                          value={nom.id}
                          checked={currentValue === nom.id}
                          onChange={() =>
                            setSelected((prev) => ({ ...prev, [cat.id]: nom.id }))
                          }
                          className="radio-custom"
                        />
                        <span className="text-xs font-medium text-[var(--card-text-dark)]">
                          {nom.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
                )}
              </section>
            );
          });
          })()}
        </div>
      </main>
    </div>
  );
}
