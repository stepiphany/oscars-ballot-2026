import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, CATEGORIES, saveCurrentParticipant, getCurrentParticipant, saveLastRoomCode } from '../lib/api';
import { BackArrowIcon } from '../components/Icons';
import { useParticipant } from '../context/ParticipantContext';

const SWIPE_THRESHOLD = 80;
const ROTATION_FACTOR = 0.08;
const EXIT_DISTANCE = 500;
const EXIT_DURATION = 280;

export default function BallotOnboard() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDisplayName } = useParticipant();
  const stateData = location.state || {};
  const [room, setRoom] = useState(stateData.room || null);
  const [participant, setParticipant] = useState(stateData.participant || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ballot, setBallot] = useState(stateData.participant?.ballot || {});
  const [finishing, setFinishing] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const pointerStartRef = useRef(null);

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
      saveLastRoomCode(code);
      setDisplayName?.(p.displayName);

      // If participant already has ballot entries, skip to ballot
      const existingBallot = p.ballot || {};
      if (Object.keys(existingBallot).length > 0) {
        navigate(`/r/${code}/ballot`, {
          state: { room: r, participant: p },
          replace: true,
        });
      }
    }
    init();
  }, [code, navigate]);

  const cat = CATEGORIES[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === CATEGORIES.length - 1;
  const hasSelection = !!ballot[cat?.id];

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function handleSkip() {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePick(nomineeId) {
    const updatedBallot = { ...ballot, [cat.id]: nomineeId };
    setBallot(updatedBallot);
    if (isLast) {
      handleFinish(updatedBallot);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function handleFinish(ballotToSubmit) {
    const ballotData = ballotToSubmit ?? ballot;
    setFinishing(true);
    try {
      await api.submitBallot(code, participant.id, ballotData);
      const updated = { ...participant, ballot: ballotData };
      setParticipant(updated);
      saveCurrentParticipant(code, updated);
      navigate(`/r/${code}/ballot`, {
        state: { room, participant: updated },
        replace: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setFinishing(false);
    }
  }

  const handlePointerStart = useCallback((clientX) => {
    if (finishing || isAnimating) return;
    pointerStartRef.current = clientX;
    setIsPointerDown(true);
  }, [finishing, isAnimating]);

  const handlePointerMove = useCallback((clientX) => {
    if (pointerStartRef.current == null || finishing || isAnimating) return;
    const delta = clientX - pointerStartRef.current;
    setDragX(delta);
  }, [finishing, isAnimating]);

  const handlePointerEnd = useCallback(() => {
    if (pointerStartRef.current == null || finishing || isAnimating) {
      setIsPointerDown(false);
      return;
    }
    const delta = dragX;
    pointerStartRef.current = null;
    setIsPointerDown(false);

    if (delta > SWIPE_THRESHOLD && !isFirst) {
      setIsAnimating(true);
      setDragX(EXIT_DISTANCE);
      setTimeout(() => {
        handleBack();
        setDragX(0);
        setIsAnimating(false);
      }, EXIT_DURATION);
    } else if (delta < -SWIPE_THRESHOLD) {
      setIsAnimating(true);
      setDragX(-EXIT_DISTANCE);
      setTimeout(() => {
        handleSkip();
        setDragX(0);
        setIsAnimating(false);
      }, EXIT_DURATION);
    } else {
      setDragX(0);
    }
  }, [dragX, finishing, isAnimating, isFirst, handleBack, handleSkip]);

  useEffect(() => {
    const onMouseUp = () => handlePointerEnd();
    const onMouseMove = (e) => handlePointerMove(e.clientX);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [handlePointerEnd, handlePointerMove]);

  if (!room || !participant || !cat) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(180deg, #87CEEB 0%, #B0D4E8 35%, #6B7B8C 70%, #4A4A4A 100%)',
          backgroundSize: 'cover',
        }}
      >
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{
        backgroundImage: 'url(/onboard-bg.png), linear-gradient(180deg, #87CEEB 0%, #B0D4E8 35%, #6B7B8C 70%, #4A4A4A 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 z-0 bg-black/35" aria-hidden />

      <main className="flex-1 min-h-0 overflow-y-auto px-6 py-6 max-w-lg mx-auto w-full relative z-10 flex flex-col items-center pb-8">
        <p className="text-white/80 text-sm tabular-nums mb-4">
          {currentIndex + 1} of {CATEGORIES.length}
        </p>
        <div
          className={`w-full max-w-md touch-pan-y select-none ${isPointerDown ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ touchAction: 'pan-y' }}
          onTouchStart={(e) => handlePointerStart(e.touches[0].clientX)}
          onTouchMove={(e) => {
            const clientX = e.touches[0].clientX;
            handlePointerMove(clientX);
            const delta = pointerStartRef.current != null ? clientX - pointerStartRef.current : 0;
            if (Math.abs(delta) > 10) e.preventDefault();
          }}
          onTouchEnd={() => handlePointerEnd()}
          onMouseDown={(e) => handlePointerStart(e.clientX)}
        >
        <section
          className="w-full bg-white/85 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl"
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX * ROTATION_FACTOR}deg) scale(${Math.max(0.9, 1 - Math.abs(dragX) / 1200)})`,
            opacity: Math.max(0.85, 1 - Math.abs(dragX) / 800),
            transition: isPointerDown ? 'none' : `transform ${EXIT_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_DURATION}ms ease-out`,
          }}
          aria-labelledby={`onboard-cat-${cat.id}`}
        >
          <div className="px-6 py-6 border-b border-[var(--card-divider)]">
            <h2 id={`onboard-cat-${cat.id}`} className="text-2xl font-bold text-[var(--card-text-dark)] leading-tight tracking-tight">
              {cat.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--card-text-muted)] font-normal">
              Pick your prediction for this category
            </p>
          </div>
          <div className="divide-y divide-[var(--card-divider)] pb-6" role="radiogroup" aria-labelledby={`onboard-cat-${cat.id}`}>
            {cat.nominees.map((nom) => (
              <label
                key={nom.id}
                className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${
                  ballot[cat.id] === nom.id ? 'bg-[var(--card-divider)]/40' : 'hover:bg-[var(--card-divider)]/20'
                }`}
              >
                <input
                  type="radio"
                  name={cat.id}
                  value={nom.id}
                  checked={ballot[cat.id] === nom.id}
                  onChange={() => handlePick(nom.id)}
                  className="radio-custom"
                  aria-describedby={`nom-${nom.id}`}
                />
                <span id={`nom-${nom.id}`} className="text-[var(--card-text-dark)] font-medium text-sm flex-1">
                  {nom.name}
                </span>
              </label>
            ))}
          </div>
        </section>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 w-full max-w-md">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst || finishing}
            className="flex items-center gap-2 text-white text-sm font-medium hover:text-white/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <BackArrowIcon className="w-4 h-4" />
            Back
          </button>
          <span className="text-white/70 text-sm shrink-0">
            Swipe left to skip
          </span>
          {isLast && hasSelection && (
            <button
              type="button"
              onClick={handleFinish}
              disabled={finishing}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-[var(--card-text-dark)] text-sm font-semibold hover:bg-white/95 disabled:opacity-50 shadow-lg"
            >
              {finishing ? 'Finishing...' : 'Finish'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
