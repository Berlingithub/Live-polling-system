
## Live polling system
System Overview:
This is a real-time polling application that allows teachers to create interactive polls and students to participate instantly. It uses WebSocket technology (Socket.io) for real-time communication between all participants.

## Features 
The teacher should be able to  
● Create new poll  
● View live polling results  
● Teacher should be able to ask a new question only if no question 
was asked previously or if all the students have answered the 
question  and 

The student should be able to 
● Enter his name while visiting for the first time this should be unique 
only to a tab i.e if i open new tabs i should be able to act as a new 
student but if i refresh the current tab i shouldn’t be asked the 
name again  
● Once the Teacher asks a question the student should be able to 
submit his answer  
● Once the student submits the answer he should be able to see the 
live polling results  
● A student should only get a maximum of 60 seconds to answer a 
question post which he will see the live polling results  


## Tech Stack

● Frontend
React 18 - Main UI framework
TypeScript - Type safety and better development experience
Tailwind CSS - Utility-first CSS framework for styling
React Router DOM - Client-side routing for navigation
Socket.io Client - Real-time communication with the server
Lucide React - Icon library
Vite - Build tool and development server

● Backend
Node.js - Runtime environment
Express.js - Web server framework
Socket.io - Real-time bidirectional communication
CORS - Cross-origin resource sharing middleware

## Key Features Implemented
-Real-time WebSocket connections
-In-memory data storage (polls, results, student management)
-Responsive design with gradient backgrounds
-Session-based student identification
-Live result visualization with animated progress bars
-Timer functionality for polls
-Student management (kick functionality)
-Poll history tracking

## How to run 

-npm install
-npm run dev
