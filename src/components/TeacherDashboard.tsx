import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Clock, BarChart3, History, UserX, Plus } from 'lucide-react';

interface Poll {
  id: number;
  question: string;
  options: string[];
  timeLimit: number;
  startTime: number;
}

interface Student {
  name: string;
  answered: boolean;
}

interface PollStats {
  totalStudents: number;
  answeredCount: number;
}

const TeacherDashboard: React.FC = () => {
  const { socket } = useSocket();
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<PollStats>({ totalStudents: 0, answeredCount: 0 });
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollHistory, setPollHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    if (!socket) return;

    socket.emit('get-current-poll');
    socket.emit('get-poll-history');

    socket.on('current-poll-state', ({ currentPoll, results, stats }) => {
      setCurrentPoll(currentPoll);
      setResults(results || {});
      setStats(stats);
    });

    socket.on('new-poll', (poll) => {
      setCurrentPoll(poll);
      setResults({});
      setShowCreatePoll(false);
    });

    socket.on('poll-results', ({ results, stats }) => {
      setResults(results);
      setStats(stats);
    });

    socket.on('students-update', ({ students, stats }) => {
      setStudents(students);
      setStats(stats);
    });

    socket.on('poll-ended', ({ results, stats }) => {
      setResults(results);
      setStats(stats);
      setCurrentPoll(null);
      socket.emit('get-poll-history');
    });

    socket.on('poll-history', (history) => {
      setPollHistory(history);
    });

    socket.on('poll-error', ({ message }) => {
      alert(message);
    });

    return () => {
      socket.off('current-poll-state');
      socket.off('new-poll');
      socket.off('poll-results');
      socket.off('students-update');
      socket.off('poll-ended');
      socket.off('poll-history');
      socket.off('poll-error');
    };
  }, [socket]);

  const handleCreatePoll = () => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      alert('Please fill all fields');
      return;
    }

    socket?.emit('create-poll', {
      question: question.trim(),
      options: options.filter(opt => opt.trim()),
      timeLimit
    });

    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const kickStudent = (studentName: string) => {
    const studentId = `student_${studentName}_${Date.now()}`;
    socket?.emit('kick-student', { studentId });
  };

  const getTotalVotes = () => Object.values(results).reduce((sum, count) => sum + count, 0);

  const getPercentage = (count: number) => {
    const total = getTotalVotes();
    return total > 0 ? (count / total * 100).toFixed(1) : '0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-blue-200">Manage your live polling session</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Connected Students</p>
                <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Responses</p>
                <p className="text-3xl font-bold text-white">{stats.answeredCount}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">Response Rate</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalStudents > 0 ? Math.round((stats.answeredCount / stats.totalStudents) * 100) : 0}%
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Poll Management */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Poll Management</h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  History
                </button>
              </div>

              {!currentPoll && !showCreatePoll && (
                <button
                  onClick={() => setShowCreatePoll(true)}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create New Poll
                </button>
              )}

              {showCreatePoll && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Question</label>
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your question..."
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Options</label>
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        {options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="text-blue-300 hover:text-blue-200 text-sm"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Time Limit (seconds)</label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                      min="10"
                      max="300"
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreatePoll}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Create Poll
                    </button>
                    <button
                      onClick={() => setShowCreatePoll(false)}
                      className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {currentPoll && (
                <div className="bg-white/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Active Poll</h3>
                  <p className="text-blue-200 mb-4">{currentPoll.question}</p>
                  <div className="text-sm text-green-300">
                    ⏱️ {currentPoll.timeLimit}s timer • {stats.answeredCount}/{stats.totalStudents} responses
                  </div>
                </div>
              )}
            </div>

            {/* Students List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Connected Students</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-gray-300 text-center py-4">No students connected</p>
                ) : (
                  students.map((student, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${student.answered ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="text-white">{student.name}</span>
                      </div>
                      <button
                        onClick={() => kickStudent(student.name)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Kick student"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {(currentPoll || Object.keys(results).length > 0) && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Live Results</h2>
                <div className="space-y-4">
                  {Object.entries(results).map(([option, count]) => (
                    <div key={option} className="space-y-2">
                      <div className="flex justify-between text-white">
                        <span>{option}</span>
                        <span>{count} votes ({getPercentage(count)}%)</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getPercentage(count)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-blue-200">
                  Total Votes: {getTotalVotes()}
                </div>
              </div>
            )}

            {/* Poll History */}
            {showHistory && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Poll History</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pollHistory.length === 0 ? (
                    <p className="text-gray-300 text-center py-4">No previous polls</p>
                  ) : (
                    pollHistory.map((poll) => (
                      <div key={poll.id} className="bg-white/10 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-2">{poll.question}</h3>
                        <div className="text-sm text-blue-200 mb-2">
                          {new Date(poll.startTime).toLocaleString()} • {poll.totalResponses} responses
                        </div>
                        <div className="space-y-1">
                          {Object.entries(poll.results).map(([option, count]) => (
                            <div key={option} className="text-sm text-gray-300">
                              {option}: {count} votes
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;