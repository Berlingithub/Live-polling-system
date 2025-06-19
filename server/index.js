import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage for polls and results
let currentPoll = null;
let pollResults = {};
let students = new Map(); // studentId -> {name, answered, socketId}
let pollHistory = [];

// Helper functions
const resetPoll = () => {
  currentPoll = null;
  pollResults = {};
  // Reset all students' answered status
  students.forEach(student => {
    student.answered = false;
  });
};

const getAllStudentsAnswered = () => {
  if (students.size === 0) return true;
  return Array.from(students.values()).every(student => student.answered);
};

const getPollStats = () => {
  const totalStudents = students.size;
  const answeredCount = Array.from(students.values()).filter(s => s.answered).length;
  return { totalStudents, answeredCount };
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Student joins with name
  socket.on('student-join', ({ name, studentId }) => {
    students.set(studentId, {
      name,
      answered: currentPoll ? false : true,
      socketId: socket.id
    });
    
    socket.emit('student-joined', { 
      success: true, 
      currentPoll,
      hasAnswered: students.get(studentId)?.answered || false
    });
    
    // Send updated student count to teachers
    io.emit('students-update', {
      students: Array.from(students.values()).map(s => ({ name: s.name, answered: s.answered })),
      stats: getPollStats()
    });
  });

  // Teacher creates a new poll
  socket.on('create-poll', ({ question, options, timeLimit = 60 }) => {
    if (currentPoll && !getAllStudentsAnswered()) {
      socket.emit('poll-error', { message: 'Cannot create poll while previous poll is active' });
      return;
    }

    currentPoll = {
      id: Date.now(),
      question,
      options,
      timeLimit,
      startTime: Date.now()
    };
    
    pollResults = {};
    options.forEach(option => {
      pollResults[option] = 0;
    });

    // Reset all students' answered status
    students.forEach(student => {
      student.answered = false;
    });

    io.emit('new-poll', currentPoll);
    
    // Auto-end poll after time limit
    setTimeout(() => {
      if (currentPoll && currentPoll.id === currentPoll.id) {
        endCurrentPoll();
      }
    }, timeLimit * 1000);
  });

  // Student submits answer
  socket.on('submit-answer', ({ studentId, answer }) => {
    if (!currentPoll) {
      socket.emit('answer-error', { message: 'No active poll' });
      return;
    }

    const student = students.get(studentId);
    if (!student) {
      socket.emit('answer-error', { message: 'Student not found' });
      return;
    }

    if (student.answered) {
      socket.emit('answer-error', { message: 'Already answered' });
      return;
    }

    // Record the answer
    if (pollResults.hasOwnProperty(answer)) {
      pollResults[answer]++;
      student.answered = true;
      
      socket.emit('answer-submitted', { success: true });
      
      // Send updated results to everyone
      io.emit('poll-results', {
        results: pollResults,
        stats: getPollStats()
      });

      // Send updated student list to teachers
      io.emit('students-update', {
        students: Array.from(students.values()).map(s => ({ name: s.name, answered: s.answered })),
        stats: getPollStats()
      });

      // Check if all students answered
      if (getAllStudentsAnswered()) {
        setTimeout(() => endCurrentPoll(), 1000);
      }
    }
  });

  // Get current poll state
  socket.on('get-current-poll', () => {
    socket.emit('current-poll-state', {
      currentPoll,
      results: pollResults,
      stats: getPollStats()
    });
  });

  // Get poll history (for teachers)
  socket.on('get-poll-history', () => {
    socket.emit('poll-history', pollHistory);
  });

  // Teacher kicks student
  socket.on('kick-student', ({ studentId }) => {
    const student = students.get(studentId);
    if (student) {
      const studentSocket = io.sockets.sockets.get(student.socketId);
      if (studentSocket) {
        studentSocket.emit('kicked');
        studentSocket.disconnect();
      }
      students.delete(studentId);
      
      io.emit('students-update', {
        students: Array.from(students.values()).map(s => ({ name: s.name, answered: s.answered })),
        stats: getPollStats()
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove student if they disconnect
    for (const [studentId, student] of students.entries()) {
      if (student.socketId === socket.id) {
        students.delete(studentId);
        io.emit('students-update', {
          students: Array.from(students.values()).map(s => ({ name: s.name, answered: s.answered })),
          stats: getPollStats()
        });
        break;
      }
    }
  });

  const endCurrentPoll = () => {
    if (currentPoll) {
      // Save to history
      pollHistory.push({
        ...currentPoll,
        results: { ...pollResults },
        endTime: Date.now(),
        totalResponses: Object.values(pollResults).reduce((sum, count) => sum + count, 0)
      });
      
      io.emit('poll-ended', {
        results: pollResults,
        stats: getPollStats()
      });
      
      resetPoll();
    }
  };
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});