import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Content from './components/Content';
import Service from './pages/Service';
import Docker from './pages/Docker';
import Command from './pages/Command';
import Nginx from './pages/Nginx';
import Settings from './pages/Settings';
import User from './pages/User';


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Content />} />
                <Route path="/service" element={<Service />} />
                <Route path="/docker" element={<Docker />} />
                <Route path='/command' element={<Command />} />
                <Route path='/nginx' element={<Nginx />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/user' element={<User />} />
              </Route>
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
