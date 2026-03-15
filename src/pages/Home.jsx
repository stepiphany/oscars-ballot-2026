import { Link } from 'react-router-dom';

const BG_STYLE = {
  backgroundImage: 'url(/onboard-bg.png), linear-gradient(180deg, #87CEEB 0%, #B0D4E8 35%, #6B7B8C 70%, #4A4A4A 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={BG_STYLE}
    >
      <div className="absolute inset-0 z-0 bg-black/35" aria-hidden />

      <main className="flex-1 flex flex-col justify-center px-6 pb-16 max-w-lg mx-auto w-full relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-white text-lg font-semibold">2026 Academy Awards</h2>
          <p className="text-white/80 text-sm mt-1">Sunday, March 15, 2026 · 7:00 PM ET</p>
        </div>
        <section className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
          <h1 className="text-2xl font-bold text-[var(--card-text-dark)] leading-tight tracking-tight mb-2">
            Make Your Predictions
          </h1>
          <p className="text-[var(--card-text-muted)] text-sm mb-6">
            Create a room and share with your watch party. Track results in real time as awards are announced.
          </p>
          <Link
            to="/create"
            className="inline-block py-3 px-6 bg-[var(--btn-bg)] text-white font-semibold text-sm rounded-xl hover:bg-[var(--btn-hover)] transition-colors w-fit"
          >
            Create room
          </Link>
        </section>
      </main>
    </div>
  );
}
