import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const BG_STYLE = {
  backgroundImage: 'url(/onboard-bg.png), linear-gradient(180deg, #87CEEB 0%, #B0D4E8 35%, #6B7B8C 70%, #4A4A4A 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const INPUT_CLASS =
  'w-full px-4 py-3 bg-white border border-[var(--card-divider)] rounded-xl text-[var(--card-text-dark)] placeholder-[var(--card-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]';

export default function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [yourName, setYourName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    if (!yourName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const room = await api.createRoom(roomName.trim());
      const { participant } = await api.joinRoom(room.code, yourName.trim());
      navigate(`/r/${room.code}/share`, { state: { room, participant } });
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={BG_STYLE}>
      <div className="absolute inset-0 z-0 bg-black/35" aria-hidden />

      <main className="flex-1 flex flex-col justify-center px-6 pb-16 max-w-lg mx-auto w-full relative z-10">
        <section className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[var(--card-text-dark)] leading-tight tracking-tight mb-2">
            Create Your Ballot
          </h2>
          <p className="text-[var(--card-text-muted)] text-sm mb-6">
            Set up a room and share the link with your watch party.
          </p>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label htmlFor="room-name" className="block text-[var(--card-text-dark)] text-sm font-medium mb-2">
                Room name
              </label>
              <input
                id="room-name"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Smith Family Oscars"
                className={INPUT_CLASS}
                aria-describedby={error ? 'create-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="your-name" className="block text-[var(--card-text-dark)] text-sm font-medium mb-2">
                Your name
              </label>
              <input
                id="your-name"
                type="text"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g. Alex"
                required
                className={INPUT_CLASS}
                aria-describedby={error ? 'create-error' : undefined}
              />
            </div>

            {error && (
              <p id="create-error" className="text-[var(--error)] text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-[var(--btn-bg)] text-white font-semibold text-sm rounded-xl hover:bg-[var(--btn-hover)] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create & Get Link'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
