import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api, CATEGORIES } from '../lib/api';

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
              <span className="font-bold text-lg tabular-nums text-[var(--card-text-dark)]">
                {p.score}
              </span>
            </li>
          ))}
        </ol>

        {ranked.length === 0 && (
          <p className="text-white text-center py-16">
            No participants yet. Share the link to get started.
          </p>
        )}
      </main>
    </div>
  );
}
