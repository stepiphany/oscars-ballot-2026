import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import ShareRoom from './pages/ShareRoom';
import JoinRoom from './pages/JoinRoom';
import Ballot from './pages/Ballot';
import BallotOnboard from './pages/BallotOnboard';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import RoomLayout from './components/RoomLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/r/:code" element={<RoomLayout />}>
          <Route index element={<JoinRoom />} />
          <Route path="share" element={<ShareRoom />} />
          <Route path="onboard" element={<BallotOnboard />} />
          <Route path="ballot" element={<Ballot />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
