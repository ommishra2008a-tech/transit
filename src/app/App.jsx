import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function App() {
  const { isAuth } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {isAuth && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
