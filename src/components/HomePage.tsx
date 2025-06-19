import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BarChart3, Clock, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-full p-6 border border-white/20">
                <BarChart3 className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Live Polling System
            </h1>
            <p className="text-xl text-blue-200 mb-12 max-w-3xl mx-auto">
              Please select the role that best describes you to begin using the live polling system
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate('/teacher')}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-2xl"
              >
                <GraduationCap className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                I'm a Teacher
              </button>
              <button
                onClick={() => navigate('/student')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-2xl"
              >
                <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                I'm a Student
              </button>
            </div>
          </div>
        </div>
      </div>

     

      {/* How It Works Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-blue-200 text-lg">Simple steps to get started with live polling</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Teacher Steps */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
                <GraduationCap className="h-8 w-8 text-emerald-400" />
                For Teachers
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Access Teacher Dashboard</h4>
                    <p className="text-blue-200">Click "I'm a Teacher" to access your control panel</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Create Your Poll</h4>
                    <p className="text-blue-200">Add your question, options, and set a time limit</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Watch Live Results</h4>
                    <p className="text-blue-200">See responses come in real-time with beautiful visualizations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Steps */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                For Students
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Join the Session</h4>
                    <p className="text-blue-200">Click "I'm a Student" and enter your name</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Answer Questions</h4>
                    <p className="text-blue-200">Respond to polls within the time limit</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">View Results</h4>
                    <p className="text-blue-200">See how your answer compares with others</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-blue-200">
            Built with React, Socket.io, and modern web technologies for the best real-time experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;