import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { LinkIcon, CheckIcon } from '../components/Icons';

const BG_STYLE = {
  backgroundImage: 'url(/onboard-bg.png), linear-gradient(180deg, #87CEEB 0%, #B0D4E8 35%, #6B7B8C 70%, #4A4A4A 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

export default function ShareRoom() {
  const { code } = useParams();
  const location = useLocation();
  const { room } = location.state || {};

  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${code}`
    : '';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            Invite Your Watch Party
          </h2>
          <p className="text-[var(--card-text-muted)] text-sm mb-6">
            Share this link so friends can join <strong className="text-[var(--card-text-dark)]">{room.name}</strong> and make their predictions.
          </p>

          <div className="mb-6">
            <label htmlFor="share-url" className="block text-[var(--card-text-dark)] text-sm font-medium mb-2">
              Shareable link
            </label>
            <div className="flex gap-2">
              <input
                id="share-url"
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 min-w-0 px-4 py-3 bg-white border border-[var(--card-divider)] rounded-xl text-[var(--card-text-dark)] text-sm font-mono"
                aria-describedby="copy-status"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 p-3 bg-white border-2 border-[var(--accent-on-light)] text-[var(--accent-on-light)] rounded-xl hover:bg-[var(--accent-on-light)]/10 transition-colors"
                id="copy-status"
                aria-label={copied ? 'Copied' : 'Copy link'}
              >
                {copied ? <CheckIcon className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={`/r/${code}`}
              className="w-full py-3 px-6 bg-[var(--btn-bg)] text-white font-semibold text-sm rounded-xl hover:bg-[var(--btn-hover)] transition-colors text-center block"
            >
              Make my picks
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
