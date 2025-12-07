import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import DownloadApp from '@/pages/DownloadApp';
import SmartWatch from '@/pages/SmartWatch';
import Groups from '@/pages/Groups';
import Fitness from '@/pages/Fitness';
import Appointments from '@/pages/Appointments';


function App() {
  return (
    <>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/download-app" element={<DownloadApp />} />
          <Route path="/smartwatch" element={<SmartWatch />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
}

export default App;
