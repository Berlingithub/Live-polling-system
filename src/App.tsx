// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import HomePage from './components/HomePage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student" element={<StudentInterface />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;