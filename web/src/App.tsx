import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServersPage from './pages/ServersPage';
import DevicesPage from './pages/DevicesPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  const { user, loading, login, register, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} onRegister={register} />;
  }

  return (
    <div className="flex">
      <Sidebar onLogout={logout} username={user.username} />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/servers" element={<ServersPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/account" element={<AccountPage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
