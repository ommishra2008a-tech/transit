import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function App() {
  const { isAuth } = useAuth();

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {isAuth && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
