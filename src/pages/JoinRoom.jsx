import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getCurrentParticipant } from '../lib/api';

const BG_STYLE = {
  backgroundImage: 'url(/onboard-bg.png), linear-gradient(180deg, #87CEEB 0%, #B0D4E8 35%, #6B7B8C 70%, #4A4A4A 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const INPUT_CLASS =
  'w-full px-4 py-3 bg-white border border-[var(--card-divider)] rounded-xl text-[var(--card-text-dark)] placeholder-[var(--card-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]';

export default function JoinRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const r = await api.getRoom(code);
        setRoom(r);
      } catch {
        setRoom(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  async function handleJoin(e) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setJoining(true);
    setError('');
    try {
      const { room: r, participant } = await api.joinRoom(code, displayName.trim());
      if (!r || !participant) {
        setError('Room not found');
        return;
      }
      setRoom(r);
      navigate(`/r/${code}/onboard`, {
        state: { room: r, participant },
        replace: true,
      });
    } catch (err) {
      setError(err.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative" style={BG_STYLE}>
        <div className="absolute inset-0 z-0 bg-black/35" aria-hidden />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col relative" style={BG_STYLE}>
        <div className="absolute inset-0 z-0 bg-black/35" aria-hidden />
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <p className="text-white mb-4">Room not found</p>
          <Link to="/" className="text-[var(--accent-on-light)] font-medium hover:text-[var(--accent)]">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={BG_STYLE}>
      <div className="absolute inset-0 z-0 bg-black/35" aria-hidden />

      <main className="flex-1 flex flex-col justify-center px-6 pb-16 max-w-lg mx-auto w-full relative z-10">
        <section className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[var(--card-text-dark)] leading-tight tracking-tight mb-2">
            Join {room.name}
          </h2>
          <p className="text-[var(--card-text-muted)] text-sm mb-6">
            Enter your name to make your predictions
          </p>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label htmlFor="display-name" className="block text-[var(--card-text-dark)] text-sm font-medium mb-2">
                Your name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sarah"
                required
                className={INPUT_CLASS}
                aria-describedby={error ? 'join-error' : undefined}
              />
            </div>

            {error && (
              <p id="join-error" className="text-[var(--error)] text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={joining}
              className="w-full py-3 px-6 bg-[var(--btn-bg)] text-white font-semibold text-sm rounded-xl hover:bg-[var(--btn-hover)] disabled:opacity-50 transition-colors"
            >
              {joining ? 'Joining...' : 'Join & Make Predictions'}
            </button>
            {getCurrentParticipant(code) && (
              <Link
                to={`/r/${code}/ballot`}
                className="block mt-3 text-center text-[var(--accent-on-light)] font-medium hover:text-[var(--accent)] text-sm"
              >
                Return to my ballot
              </Link>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
