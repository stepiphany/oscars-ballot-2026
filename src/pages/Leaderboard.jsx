import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api, CATEGORIES, getCurrentParticipant } from '../lib/api';
import { RemoveIcon } from '../components/Icons';

function calculateScore(ballot, results) {
  let score = 0;
  for (const [catId, result] of Object.entries(results)) {
    const winnerId = result?.winnerId;
    if (winnerId && ballot[catId] === winnerId) score++;
  }
  return score;
}

const PREVIEW_PARTICIPANTS = [
  { id: 'preview-1', displayName: 'Alex', ballot: { 'best-picture': 'hamnet', 'best-director': 'zhao', 'best-actor': 'chalamet' } },
  { id: 'preview-2', displayName: 'Jordan', ballot: { 'best-picture': 'marty-supreme', 'best-director': 'safdie', 'best-actor': 'chalamet' } },
  { id: 'preview-3', displayName: 'Sam', ballot: { 'best-picture': 'hamnet', 'best-director': 'pta', 'best-actor': 'dicaprio' } },
  { id: 'preview-4', displayName: 'Riley', ballot: { 'best-picture': 'frankenstein', 'best-director': 'zhao', 'best-actor': 'jordan' } },
  { id: 'preview-5', displayName: 'Casey', ballot: { 'best-picture': 'hamnet', 'best-director': 'zhao', 'best-actor': 'chalamet' } },
];

const PREVIEW_RESULTS = {
  'best-picture': { winnerId: 'hamnet', announcedAt: new Date().toISOString() },
  'best-director': { winnerId: 'zhao', announcedAt: new Date().toISOString() },
  'best-actor': { winnerId: 'chalamet', announcedAt: new Date().toISOString() },
};

export default function Leaderboard() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  async function handleRemove(p) {
    if (!api.removeParticipant) return;
    setConfirmRemove(p);
  }

  async function confirmRemoveParticipant() {
    if (!confirmRemove || !api.removeParticipant) return;
    const p = confirmRemove;
    setConfirmRemove(null);
    setRemoving(p.id);
    try {
      await api.removeParticipant(code, p.id);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  }

  async function load() {
    if (isPreview) {
      setRoom({ id: 'preview', code, name: 'Oscars Watch Party' });
      setParticipants(PREVIEW_PARTICIPANTS);
      setResults(PREVIEW_RESULTS);
      setLoading(false);
      return;
    }
    try {
      const r = await api.getRoom(code);
      setRoom(r);
      if (r) {
        const p = await api.getParticipants(code);
        setParticipants(p);
      }
      const resRaw = api.getResults?.();
      const res = resRaw?.then ? await resRaw : (resRaw ?? {});
      setResults(typeof res === 'object' ? res : {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [code, isPreview]);

  useEffect(() => {
    if (!api.subscribeParticipants && !api.subscribeResults) return;
    let sub1, sub2;
    (async () => {
      if (api.subscribeParticipants) {
        sub1 = await api.subscribeParticipants(code, load);
      }
      if (api.subscribeResults) {
        sub2 = api.subscribeResults(load);
      }
    })();
    return () => {
      sub1?.unsubscribe?.();
      sub2?.unsubscribe?.();
    };
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-white mb-4">Room not found</p>
        <Link to="/" className="text-white font-medium hover:text-white/90">
          ← Back home
        </Link>
      </div>
    );
  }

  const resultsCount = Object.keys(results).length;
  const sorted = participants
    .map((p) => ({
      ...p,
      score: calculateScore(p.ballot || {}, results),
    }))
    .sort((a, b) => b.score - a.score);

  const ranked = sorted.reduce((acc, p, i) => {
    const rank = i === 0 ? 1 : (p.score === acc[i - 1].score ? acc[i - 1].rank : i + 1);
    return [...acc, { ...p, rank }];
  }, []);

  const currentParticipant = getCurrentParticipant(code);
  const canRemove = (p) => currentParticipant?.id !== p.id;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <main className="flex-1 min-h-0 overflow-y-auto px-6 py-6 pb-20 max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-2">
          {room.name}
        </h2>
        <p className="text-white text-sm mb-8">
          {resultsCount} of {CATEGORIES.length} awards announced
        </p>

        <ol className="space-y-3" aria-label="Rankings">
          {ranked.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-4 p-4 bg-white/85 backdrop-blur-sm rounded-2xl shadow-lg"
            >
              <span
                className="w-10 h-10 flex items-center justify-center font-bold text-sm rounded-xl shrink-0 bg-transparent border border-[var(--card-divider)] text-[var(--card-text-dark)]"
                aria-label={`Rank ${p.rank}`}
              >
                {p.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--card-text-dark)] truncate">
                  {p.displayName}
                </p>
              </div>
              <span className="font-bold text-lg tabular-nums text-[var(--card-text-dark)] w-8 text-right shrink-0">
                {p.score}
              </span>
              <div className="w-10 shrink-0 flex items-center justify-center">
                {!isPreview && api.removeParticipant && canRemove(p) ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(p)}
                    disabled={removing === p.id}
                    className="p-2 rounded-lg text-[var(--card-text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
                    aria-label={`Remove ${p.displayName}`}
                  >
                    <RemoveIcon className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {ranked.length === 0 && (
          <p className="text-white text-center py-16">
            No participants yet. Share the link to get started.
          </p>
        )}
      </main>

      {confirmRemove && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-remove-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 id="confirm-remove-title" className="text-lg font-bold text-[var(--card-text-dark)] mb-2">
              Remove from leaderboard?
            </h3>
            <p className="text-[var(--card-text-muted)] text-sm mb-6">
              Remove <strong className="text-[var(--card-text-dark)]">{confirmRemove.displayName}</strong> from the leaderboard? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                className="px-4 py-2.5 rounded-xl text-[var(--card-text-dark)] font-medium hover:bg-[var(--card-divider)]/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveParticipant}
                className="px-4 py-2.5 rounded-xl bg-[var(--error)] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
