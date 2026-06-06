import VideoPlayer from './components/VideoPlayer';
import LoginButton from "./components/LoginButton";
import UserProfile from "./components/UserProfile";
import useAuth from "./auth/useAuth";
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        {
          isAuthenticated
            ? <UserProfile />
            : <LoginButton />
        }
      </header>
      <VideoPlayer />
    </div>
  );
}

export default App
