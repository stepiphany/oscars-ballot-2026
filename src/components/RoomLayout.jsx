import { Outlet, useParams, useLocation, NavLink } from 'react-router-dom';
import { ParticipantProvider } from '../context/ParticipantContext';
import WinnerCelebration from './WinnerCelebration';

const TAB_BG_STYLE = {
  backgroundImage: 'url(/onboard-bg.png), linear-gradient(180deg, #87CEEB 0%, #B0D4E8 35%, #6B7B8C 70%, #4A4A4A 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

function RoomNav() {
  const { code } = useParams();
  const location = useLocation();
  const isBallot = location.pathname.includes('/ballot');
  const isLeaderboard = location.pathname.includes('/leaderboard');
  const isAdmin = location.pathname.includes('/admin');
  const showTabBar = isBallot || isLeaderboard || isAdmin;
  const ballotLabel = 'My Ballot';

  if (!showTabBar) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4"
      aria-label="Room navigation"
    >
      <div className="max-w-lg mx-auto bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden p-1.5">
        <div className="flex gap-1 items-stretch">
          <NavLink
            to={`/r/${code}/ballot`}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center py-3 px-4 text-sm font-semibold transition-all rounded-2xl ${
                isActive
                  ? 'text-[var(--card-text-dark)] bg-white shadow-md'
                  : 'text-black/80 hover:text-black hover:bg-white/15'
              }`
            }
          >
            {ballotLabel}
          </NavLink>
          <NavLink
            to={`/r/${code}/leaderboard`}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center py-3 px-4 text-sm font-semibold transition-all rounded-2xl ${
                isActive
                  ? 'text-[var(--card-text-dark)] bg-white shadow-md'
                  : 'text-black/80 hover:text-black hover:bg-white/15'
              }`
            }
          >
            Leaderboard
          </NavLink>
          <NavLink
            to={`/r/${code}/admin`}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center py-3 px-4 text-sm font-semibold transition-all rounded-2xl ${
                isActive
                  ? 'text-[var(--card-text-dark)] bg-white shadow-md'
                  : 'text-black/80 hover:text-black hover:bg-white/15'
              }`
            }
          >
            Admin
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function RoomLayout() {
  return (
    <ParticipantProvider>
      <div
        className="min-h-screen"
        style={TAB_BG_STYLE}
      >
        <div className="absolute inset-0 bg-black/35" aria-hidden />
        <div className="relative min-h-screen">
          <Outlet />
          <RoomNav />
          <WinnerCelebration />
        </div>
      </div>
    </ParticipantProvider>
  );
}
