import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, CATEGORIES, saveCurrentParticipant, getCurrentParticipant, saveLastRoomCode } from '../lib/api';
import { useParticipant } from '../context/ParticipantContext';
import { LinkIcon, CheckIcon } from '../components/Icons';

export default function Ballot() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDisplayName } = useParticipant();
  const stateData = location.state || {};
  const [room, setRoom] = useState(stateData.room || null);
  const [participant, setParticipant] = useState(stateData.participant || null);

  const [ballot, setBallot] = useState({});
  const [results, setResults] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [lastAutosaveTime, setLastAutosaveTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const ballotRef = useRef(ballot);
  ballotRef.current = ballot;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${code}` : '';

  async function loadResults() {
    const resRaw = api.getResults?.();
    const res = resRaw?.then ? await resRaw : (resRaw ?? {});
    setResults(typeof res === 'object' ? res : {});
  }

  async function handleCopyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  useEffect(() => {
    async function init() {
      let r = stateData.room;
      let p = stateData.participant;
      if (!r) r = await api.getRoom(code);
      if (!p) p = getCurrentParticipant(code);
      if (!r) {
        navigate(`/r/${code}`);
        return;
      }
      if (!p) {
        navigate(`/r/${code}`, { replace: true });
        return;
      }
      setRoom(r);
      setParticipant(p);
      setBallot(p.ballot || {});
      setIsLocked(api.isLocked());
      saveCurrentParticipant(code, p);
      saveLastRoomCode(code);
      setDisplayName?.(p.displayName);
      loadResults();
    }
    init();
  }, [code, navigate]);

  useEffect(() => {
    if (!api.subscribeResults) return;
    const sub = api.subscribeResults(loadResults);
    return () => sub?.unsubscribe?.();
  }, []);

  async function handleSave(ballotToSave = ballot, isAutoSave = false) {
    if (isAutoSave) setAutosaving(true);
    else setLoading(true);
    try {
      await api.submitBallot(code, participant.id, ballotToSave);
      const updated = { ...participant, ballot: ballotToSave };
      setParticipant(updated);
      saveCurrentParticipant(code, updated);
      if (isAutoSave) {
        setLastAutosaveTime(new Date());
        setAutosaving(false);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isAutoSave) setLoading(false);
    }
  }

  useEffect(() => {
    if (!room || !participant || isLocked) return;
    const current = ballotRef.current;
    const prev = participant?.ballot ?? {};
    if (Object.keys(current).length === 0 && Object.keys(prev).length === 0) return;
    const changed = Object.keys(current).some((k) => current[k] !== prev[k]) ||
      Object.keys(prev).some((k) => current[k] !== prev[k]);
    if (!changed) return;
    const timer = setTimeout(() => {
      handleSave(ballotRef.current, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [ballot]);

  function setPick(categoryId, nomineeId) {
    if (isLocked) return;
    setBallot((prev) => ({ ...prev, [categoryId]: nomineeId }));
  }

  function handleClearSelections() {
    if (isLocked) return;
    setBallot({});
  }

  function handleExportBallot() {
    const data = {
      roomCode: code,
      displayName: participant.displayName,
      ballot,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oscars-ballot-backup-${code}-${participant.displayName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportBallot() {
    setImportError('');
    try {
      const data = JSON.parse(importText);
      const imported = data.ballot;
      if (!imported || typeof imported !== 'object') {
        setImportError('Invalid backup: no ballot data found');
        return;
      }
      const merged = { ...ballot, ...imported };
      setBallot(merged);
      setImportOpen(false);
      setImportText('');
      handleSave(merged);
    } catch {
      setImportError('Invalid backup format. Paste a previously exported ballot file.');
    }
  }

  const points = CATEGORIES.filter(
    (cat) => results[cat.id]?.winnerId && ballot[cat.id] === results[cat.id].winnerId
  ).length;
  const totalCategories = CATEGORIES.length;

  const filteredCategories = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.nominees.some((n) => n.name.toLowerCase().includes(q))
    );
  })();

  function formatLastSaved(date) {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  if (!room || !participant) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <main className="flex-1 min-h-0 overflow-y-auto px-6 py-6 pb-20 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 p-4 mb-2 rounded-xl">
          <h2 className="text-2xl font-bold text-white">
            {room.name}
          </h2>
          <button
            type="button"
            onClick={handleCopyShare}
            className="p-2 -m-2 text-white/80 hover:text-white transition-colors"
            aria-label={shareCopied ? 'Link copied' : 'Copy share link'}
          >
            {shareCopied ? <CheckIcon /> : <LinkIcon />}
          </button>
        </div>
        <div className="mb-6 bg-white/85 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 min-w-0">
            <h3 className="text-lg font-bold text-[var(--card-text-dark)] truncate min-w-0">
              {participant.displayName}&apos;s ballot
            </h3>
            {!isLocked && (autosaving || loading || lastAutosaveTime || saved) && (
              <span className="text-[var(--card-text-muted)] text-sm shrink-0 whitespace-nowrap">
                {autosaving ? 'Autosaving...' : loading ? 'Saving...' : lastAutosaveTime ? `Autosaved ${formatLastSaved(lastAutosaveTime)}` : 'Saved'}
              </span>
            )}
          </div>
          <p className="text-[var(--card-text-muted)] text-sm">
            Points earned: <span className="font-semibold tabular-nums text-[var(--card-text-dark)]">{points}/{totalCategories}</span>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleExportBallot}
              disabled={isLocked}
              className="text-[var(--accent-on-light)] text-sm font-medium hover:text-[var(--accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
            >
              Export ballot
            </button>
            <button
              type="button"
              onClick={() => { setImportOpen(true); setImportError(''); setImportText(''); }}
              disabled={isLocked}
              className="text-[var(--accent-on-light)] text-sm font-medium hover:text-[var(--accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
            >
              Import ballot
            </button>
            {!isLocked && Object.keys(ballot).length > 0 && (
              <button
                type="button"
                onClick={handleClearSelections}
                className="text-[var(--error)] text-sm font-medium hover:underline"
              >
                Clear all my selections
              </button>
            )}
            {!isLocked && expandedCategory && (
              <button
                type="button"
                onClick={() => setExpandedCategory(null)}
                className="text-[var(--accent-on-light)] text-sm font-medium hover:text-[var(--accent)] hover:underline"
              >
                Collapse all
              </button>
            )}
          </div>
        </div>

        {importOpen && (
          <div
            className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-title"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
              <h3 id="import-title" className="text-lg font-bold text-[var(--card-text-dark)] mb-2">
                Restore from backup
              </h3>
              <p className="text-[var(--card-text-muted)] text-sm mb-4">
                Paste the contents of a previously exported ballot file below.
              </p>
              <textarea
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                placeholder='{"roomCode":"...","ballot":{...},...}'
                className="flex-1 min-h-[120px] w-full px-4 py-3 border border-[var(--card-divider)] rounded-xl text-[var(--card-text-dark)] text-sm font-mono resize-none"
                aria-describedby={importError ? 'import-error' : undefined}
              />
              {importError && (
                <p id="import-error" className="text-[var(--error)] text-sm mt-2" role="alert">
                  {importError}
                </p>
              )}
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => { setImportOpen(false); setImportText(''); setImportError(''); }}
                  className="px-4 py-2.5 rounded-xl text-[var(--card-text-dark)] font-medium hover:bg-[var(--card-divider)]/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportBallot}
                  className="px-4 py-2.5 rounded-xl bg-[var(--btn-bg)] text-white font-semibold hover:bg-[var(--btn-hover)] transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        )}

        {isLocked && (
          <div
            className="mb-6 p-4 bg-white/85 backdrop-blur-sm rounded-2xl shadow-lg text-[var(--card-text-dark)] text-sm"
            role="status"
          >
            Ballots are locked. The ceremony has started.
          </div>
        )}

        <div className="mb-4 space-y-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full min-h-[44px] pl-4 pr-4 py-2.5 text-base bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 shadow-lg"
            aria-label="Search categories"
          />
        </div>

        <div className="space-y-4">
          {filteredCategories.map((cat) => {
            const result = results[cat.id];
            const winnerNom = result?.winnerId
              ? cat.nominees.find((n) => n.id === result.winnerId)
              : null;
            const isCorrect = result?.winnerId && ballot[cat.id] === result.winnerId;
            const userPickNom = ballot[cat.id]
              ? cat.nominees.find((n) => n.id === ballot[cat.id])
              : null;
            const hasSavedSelection = !!participant.ballot?.[cat.id];
            const showCollapsed =
              hasSavedSelection &&
              !(!isLocked && expandedCategory === cat.id);

            if (showCollapsed) {
              return (
                <section
                  key={cat.id}
                  className={`bg-white/85 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg px-5 py-4 flex items-center justify-between gap-4 ${
                    !isLocked ? 'cursor-pointer hover:bg-[var(--card-divider)]/10 transition-colors' : ''
                  }`}
                  aria-labelledby={`cat-${cat.id}`}
                  onClick={!isLocked ? () => setExpandedCategory(cat.id) : undefined}
                  onKeyDown={
                    !isLocked
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setExpandedCategory(cat.id);
                          }
                        }
                      : undefined
                  }
                  role={!isLocked ? 'button' : undefined}
                  tabIndex={!isLocked ? 0 : undefined}
                >
                  <div className="min-w-0 flex-1">
                    <h2 id={`cat-${cat.id}`} className="card-title text-[var(--card-text-dark)] leading-tight">
                      {cat.name}
                    </h2>
                    {result?.winnerId ? (
                      <>
                        <p
                          className="card-body mt-0.5 truncate"
                          style={{ color: 'var(--oscars-gold)' }}
                        >
                          {winnerNom?.name ?? result.winnerId ?? '—'}
                        </p>
                        {!isCorrect && userPickNom && (
                          <p className="card-body mt-0.5 text-[var(--card-text-muted)] line-through truncate">
                            {userPickNom.name}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {userPickNom && (
                          <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--oscars-gold)' }}>
                            Your pick
                          </p>
                        )}
                        <p className="card-body mt-0.5 truncate text-[var(--card-text-dark)]">
                          {userPickNom?.name ?? '—'}
                        </p>
                      </>
                    )}
                  </div>
                  {result?.winnerId ? (
                    <span
                      className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                        isCorrect
                          ? 'bg-[var(--success)]/20'
                          : 'bg-[var(--card-divider)] text-[var(--card-text-muted)]'
                      }`}
                      style={isCorrect ? { color: 'var(--success)' } : undefined}
                      aria-label={isCorrect ? 'Correct prediction' : 'No points'}
                    >
                      {isCorrect ? '+1' : '0'}
                    </span>
                  ) : null}
                  {!isLocked && (
                    <span className="sr-only">Tap to edit your selection</span>
                  )}
                </section>
              );
            }

            return (
              <section
                key={cat.id}
                className="bg-white/85 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg"
                aria-labelledby={`cat-${cat.id}`}
              >
                <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[var(--card-divider)]">
                  <h2 id={`cat-${cat.id}`} className="card-title text-[var(--card-text-dark)] leading-tight">
                    {cat.name}
                  </h2>
                  {!isLocked && expandedCategory === cat.id && (
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(null)}
                      className="text-[var(--accent-on-light)] text-xs font-medium shrink-0 hover:text-[var(--accent)]"
                    >
                      Done
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[var(--card-divider)]" role="radiogroup" aria-labelledby={`cat-${cat.id}`}>
                  {cat.nominees.map((nom) => {
                    const isSelected = ballot[cat.id] === nom.id;
                    const hasSavedSelection = !!participant.ballot?.[cat.id];
                    const isGreyedOut = hasSavedSelection && !isSelected;
                    return (
                    <label
                      key={nom.id}
                      className={`flex items-center justify-between gap-4 px-5 py-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--card-divider)]/30'
                          : 'hover:bg-[var(--card-divider)]/20'
                      } ${isLocked ? 'cursor-default' : ''} ${isGreyedOut ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="radio"
                          name={cat.id}
                          value={nom.id}
                          checked={ballot[cat.id] === nom.id}
                          onChange={() => setPick(cat.id, nom.id)}
                          disabled={isLocked}
                          className="radio-custom"
                          aria-describedby={`nom-${nom.id}`}
                        />
                        <span id={`nom-${nom.id}`} className={`text-xs font-medium ${isGreyedOut ? 'text-[var(--text-muted)]' : 'text-[var(--card-text-dark)]'}`}>
                          {nom.name}
                        </span>
                      </div>
                    </label>
                  );})}
                </div>
              </section>
            );
          })}
        </div>
      </main>

    </div>
  );
}
