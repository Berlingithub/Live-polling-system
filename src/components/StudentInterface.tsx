import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Clock, CheckCircle, BarChart3, User } from 'lucide-react';

interface Poll {
  id: number;
  question: string;
  options: string[];
  timeLimit: number;
  startTime: number;
}

interface PollStats {
  totalStudents: number;
  answeredCount: number;
}

const StudentInterface: React.FC = () => {
  const { socket, connected } = useSocket();
  const [studentName, setStudentName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [results, setResults] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [stats, setStats] = useState<PollStats>({ totalStudents: 0, answeredCount: 0 });
  const [isKicked, setIsKicked] = useState(false);

  const studentId = React.useMemo(() => {
    // Create unique ID for this browser tab
    let id = sessionStorage.getItem('studentId');
    if (!id) {
      id = `student_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('studentId', id);
    }
    return id;
  }, []);

  useEffect(() => {
    // Check if student name is already stored in session
    const storedName = sessionStorage.getItem('studentName');
    if (storedName) {
      setStudentName(storedName);
      setIsJoined(true);
      if (socket && connected) {
        socket.emit('student-join', { name: storedName, studentId });
      }
    }
  }, [socket, connected, studentId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('student-joined', ({ success, currentPoll, hasAnswered }) => {
      if (success) {
        setIsJoined(true);
        setCurrentPoll(currentPoll);
        setHasAnswered(hasAnswered || false);
        if (currentPoll) {
          const elapsed = (Date.now() - currentPoll.startTime) / 1000;
          const remaining = Math.max(0, currentPoll.timeLimit - elapsed);
          setTimeLeft(Math.floor(remaining));
        }
      }
    });

    socket.on('new-poll', (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedAnswer('');
      setResults({});
      setTimeLeft(poll.timeLimit);
    });

    socket.on('answer-submitted', ({ success }) => {
      if (success) {
        setHasAnswered(true);
      }
    });

    socket.on('poll-results', ({ results, stats }) => {
      setResults(results);
      setStats(stats);
    });

    socket.on('poll-ended', ({ results, stats }) => {
      setResults(results);
      setStats(stats);
      setCurrentPoll(null);
      setHasAnswered(false);
      setTimeLeft(0);
    });

    socket.on('answer-error', ({ message }) => {
      alert(message);
    });

    socket.on('kicked', () => {
      setIsKicked(true);
      sessionStorage.removeItem('studentName');
      sessionStorage.removeItem('studentId');
    });

    return () => {
      socket.off('student-joined');
      socket.off('new-poll');
      socket.off('answer-submitted');
      socket.off('poll-results');
      socket.off('poll-ended');
      socket.off('answer-error');
      socket.off('kicked');
    };
  }, [socket]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && currentPoll && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentPoll, hasAnswered]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    sessionStorage.setItem('studentName', studentName.trim());
    socket?.emit('student-join', { name: studentName.trim(), studentId });
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentPoll) return;

    socket?.emit('submit-answer', {
      studentId,
      answer: selectedAnswer
    });
  };

  const getTotalVotes = () => Object.values(results).reduce((sum, count) => sum + count, 0);

  const getPercentage = (count: number) => {
    const total = getTotalVotes();
    return total > 0 ? (count / total * 100).toFixed(1) : '0';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isKicked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="text-red-300 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">You've been removed</h1>
          <p className="text-red-200 mb-6">You have been kicked from the polling session by the teacher.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="text-orange-300 text-6xl mb-4">🔄</div>
          <h1 className="text-2xl font-bold text-white mb-4">Connecting...</h1>
          <p className="text-orange-200">Please wait while we connect you to the server.</p>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <User className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Join Polling Session</h1>
            <p className="text-blue-200">Enter your name to participate</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 text-lg"
            >
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {studentName}!</h1>
          <p className="text-blue-200">Live Polling Session</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-300">Connected</span>
            </div>
            <div className="text-blue-200 text-sm">
              {stats.totalStudents} students online
            </div>
          </div>
        </div>

        {!currentPoll && Object.keys(results).length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Waiting for Question</h2>
            <p className="text-blue-200">The teacher will start a poll soon. Stay tuned!</p>
          </div>
        )}

        {currentPoll && !hasAnswered && timeLeft > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Answer the Question</h2>
              <div className="flex items-center gap-2 text-orange-300">
                <Clock className="h-5 w-5" />
                <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl text-white mb-6">{currentPoll.question}</h3>
              <div className="space-y-3">
                {currentPoll.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full p-4 rounded-lg text-left transition-all transform hover:scale-105 ${
                      selectedAnswer === option
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-2 border-blue-400'
                        : 'bg-white/20 text-white border-2 border-white/30 hover:bg-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === option
                          ? 'bg-white border-white'
                          : 'border-white/50'
                      }`} />
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none text-lg"
            >
              Submit Answer
            </button>
          </div>
        )}

        {(hasAnswered || timeLeft === 0 || Object.keys(results).length > 0) && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              {hasAnswered ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h2 className="text-2xl font-semibold text-white">Answer Submitted!</h2>
                </>
              ) : (
                <>
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                  <h2 className="text-2xl font-semibold text-white">Live Results</h2>
                </>
              )}
            </div>

            {currentPoll && (
              <div className="mb-6">
                <h3 className="text-lg text-blue-200 mb-2">Question:</h3>
                <p className="text-white">{currentPoll.question}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {Object.entries(results).map(([option, count]) => (
                <div key={option} className="space-y-2">
                  <div className="flex justify-between text-white">
                    <span className={selectedAnswer === option ? 'font-semibold text-blue-300' : ''}>{option}</span>
                    <span>{count} votes ({getPercentage(count)}%)</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        selectedAnswer === option
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${getPercentage(count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-blue-200 bg-white/10 rounded-lg p-4">
              <div className="text-sm">
                Total Responses: {getTotalVotes()} / {stats.totalStudents} students
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalStudents > 0 ? (getTotalVotes() / stats.totalStudents) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;