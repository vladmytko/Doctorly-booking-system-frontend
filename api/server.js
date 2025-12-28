const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Store active users
const users = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registers with a username
  socket.on('register', (username) => {
    console.log(`${username} registered`);
    users[socket.id] = { username, socketId: socket.id };
    
    // Broadcast updated user list to all clients
    io.emit('users_list', Object.values(users));
  });

  // Handle call initiation
  socket.on('call_user', (data) => {
    const { userToCall, from, signal } = data;
    
    io.to(userToCall).emit('incoming_call', {
      signal,
      from,
      callerName: users[socket.id]?.username
    });
  });

  // Handle call acceptance
  socket.on('answer_call', (data) => {
    io.to(data.to).emit('call_accepted', data.signal);
  });

  // Handle call rejection
  socket.on('reject_call', (data) => {
    io.to(data.from).emit('call_rejected', {
      reason: data.reason || 'User rejected the call'
    });
  });

  // Handle call end
  socket.on('end_call', (data) => {
    if (data.to) {
      io.to(data.to).emit('call_ended');
    }
  });

  // Handle ICE candidates exchange
  socket.on('ice_candidate', (data) => {
    if (data.to) {
      io.to(data.to).emit('ice_candidate', data.candidate);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete users[socket.id];
    io.emit('users_list', Object.values(users));
  });
});

const PORT = process.env.PORT || 8082;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));