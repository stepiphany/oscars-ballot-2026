import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api, CATEGORIES, consumeShowWinnerCelebration } from '../lib/api';

const OSCARS_COLORS = [
  '#FFD700', '#D4AF37', '#C5B358', '#B8860B', '#CFB53B', '#F7E7CE', '#1a1a1a',
];

function calculateScore(ballot, results) {
  let score = 0;
  for (const [catId, result] of Object.entries(results)) {
    const winnerId = result?.winnerId;
    if (winnerId && ballot[catId] === winnerId) score++;
  }
  return score;
}

export default function WinnerCelebration() {
  const { code } = useParams();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const confettiCanvasRef = useRef(null);

  useEffect(() => {
    if (!code) return;
    async function load() {
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
      }
    }
    load();
  }, [code]);

  useEffect(() => {
    if (!code || !api.subscribeParticipants && !api.subscribeResults) return;
    async function load() {
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
      }
    }
    let sub1, sub2;
    (async () => {
      if (api.subscribeParticipants) sub1 = await api.subscribeParticipants(code, load);
      if (api.subscribeResults) sub2 = await api.subscribeResults(load);
    })();
    return () => {
      sub1?.unsubscribe?.();
      sub2?.unsubscribe?.();
    };
  }, [code]);

  function checkCelebration() {
    if (!room || !participants.length) return;
    const resultsCount = Object.keys(results).length;
    if (resultsCount !== CATEGORIES.length) return;
    const sorted = participants
      .map((p) => ({ ...p, score: calculateScore(p.ballot || {}, results) }))
      .sort((a, b) => b.score - a.score);
    const ranked = sorted.reduce((acc, p, i) => {
      const rank = i === 0 ? 1 : (p.score === acc[i - 1].score ? acc[i - 1].rank : i + 1);
      return [...acc, { ...p, rank }];
    }, []);
    if (!ranked[0]) return;
    if (!consumeShowWinnerCelebration()) return;
    setShowPopup(true);
  }

  useEffect(() => {
    if (!room || !participants.length) return;
    const onShowWinner = () => checkCelebration();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkCelebration();
    };
    const onStorage = () => checkCelebration();
    checkCelebration();
    window.addEventListener('showWinnerCelebration', onShowWinner);
    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('showWinnerCelebration', onShowWinner);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [room, participants, results]);

  useEffect(() => {
    if (!showPopup) return;
    const id = setTimeout(() => {
      const canvas = confettiCanvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const fire = confetti.create(canvas, { resize: true });
      fire({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: OSCARS_COLORS });
      setTimeout(() => fire({ particleCount: 80, spread: 120, origin: { y: 0.4, x: 0.2 }, colors: OSCARS_COLORS }), 200);
      setTimeout(() => fire({ particleCount: 80, spread: 120, origin: { y: 0.4, x: 0.8 }, colors: OSCARS_COLORS }), 400);
    }, 50);
    return () => clearTimeout(id);
  }, [showPopup]);

  if (!showPopup || !room || !participants.length) return null;

  const sorted = participants
    .map((p) => ({ ...p, score: calculateScore(p.ballot || {}, results) }))
    .sort((a, b) => b.score - a.score);
  const ranked = sorted.reduce((acc, p, i) => {
    const rank = i === 0 ? 1 : (p.score === acc[i - 1].score ? acc[i - 1].rank : i + 1);
    return [...acc, { ...p, rank }];
  }, []);

  if (!ranked[0]) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
      onClick={() => setShowPopup(false)}
    >
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 50, width: '100%', height: '100%' }}
      />
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="winner-title" className="text-[var(--card-text-muted)] text-sm font-medium uppercase tracking-wider mb-2">
          Winner of {room.name}
        </p>
        <h3 className="text-2xl font-bold text-[var(--card-text-dark)] mb-2">
          {ranked[0].displayName}
        </h3>
        <p className="text-[var(--card-text-muted)] text-sm mb-6">
          {ranked[0].score} of {CATEGORIES.length} correct
        </p>
        <button
          type="button"
          onClick={() => setShowPopup(false)}
          className="w-full px-4 py-3 rounded-xl bg-[var(--btn-bg)] text-white font-semibold hover:bg-[var(--btn-hover)] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
