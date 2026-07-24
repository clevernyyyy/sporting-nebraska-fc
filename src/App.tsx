import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import CameraComparison from './pages/CameraComparison';
import DomainIdeas from './pages/DomainIdeas';

function WithLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/camera-comparison" element={<CameraComparison />} />
        <Route path="/domain-ideas" element={<DomainIdeas />} />
        <Route element={<WithLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:id" element={<PlayerDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
