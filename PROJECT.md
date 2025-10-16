# Real-Time Chat App Development Guide

## 🚀 Project Overview

This guide outlines the complete development process for building a functional chat application using Next.js and Chakra UI.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.5 (App Router)
- **UI Library**: Chakra UI
- **Database**: PostgreSQL (recommend Neon for serverless)
- **Real-time**: Socket.IO
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## 📋 Phase-by-Phase Development Plan

### Phase 1: Project Setup & Foundation

#### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest chat-app --typescript --tailwind --eslint
cd chat-app
```

#### 1.2 Install Dependencies
```bash
# Core dependencies
npm install @chakra-ui/react @chakra-ui/next-js @emotion/react @emotion/styled framer-motion

# Backend & real-time
npm install socket.io socket.io-client
npm install @types/socket.io -D

# Database & authentication
npm install next-auth @auth/prisma-adapter
npm install prisma @prisma/client
npm install bcryptjs @types/bcryptjs -D
```

#### 1.3 Configure Chakra UI
Create `providers/ChakraProvider.tsx`:
```tsx
'use client'

import { ChakraProvider } from '@chakra-ui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>
}
```

Update `app/layout.tsx`:
```tsx
import { Providers } from '@/providers/ChakraProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Phase 2: Database Design & Setup

#### 2.1 Database Schema (Prisma)

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  conversations ConversationParticipant[]
  messages      Message[]
}

model Conversation {
  id           String                     @id @default(cuid())
  name         String?                    // For group chats
  isGroup      Boolean                   @default(false)
  createdAt    DateTime                   @default(now())
  updatedAt    DateTime                   @updatedAt

  // Relations
  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  id             String         @id @default(cuid())
  userId         String
  conversationId String
  joinedAt       DateTime       @default(now())

  // Relations
  user         User           @relation(fields: [userId], onDelete: Cascade)
  conversation Conversation   @relation(fields: [conversationId], onDelete: Cascade)

  @@unique([userId, conversationId])
}

model Message {
  id             String         @id @default(cuid())
  content        String
  conversationId String
  senderId       String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  // Relations
  conversation Conversation @relation(fields: [conversationId], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], onDelete: Cascade)

  @@index([conversationId, createdAt])
}
```

#### 2.2 Database Setup
```bash
# Initialize Prisma
npx prisma generate
npx prisma db push

# For production, use migrations:
npx prisma migrate dev --name init
```

### Phase 3: Real-time Communication Setup

#### 3.1 Socket.IO Server Setup

Create `app/api/socket/route.ts`:
```tsx
import { NextRequest } from 'next/server';
import { Server } from 'socket.io';

export async function GET(req: NextRequest) {
  // This route initializes Socket.IO
  // Implementation details below
}
```

Create `lib/socket-server.ts`:
```tsx
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(req: any, res: NextApiResponse) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join conversation room
      socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${socket.id} left conversation ${conversationId}`);
      });

      // Send message
      socket.on('send_message', async (data) => {
        const { conversationId, content, senderId } = data;
        
        // Save to database (pseudocode)
        // const message = await prisma.message.create({...});
        
        // Broadcast to all users in the conversation
        socket.to(conversationId).emit('receive_message', data);
        socket.emit('receive_message', data); // Also send back to sender
      });

      // Typing indicators
      socket.on('typing_start', (data) => {
        socket.to(data.conversationId).emit('user_typing', data);
      });

      socket.on('typing_stop', (data) => {
        socket.to(data.conversationId).emit('user_stop_typing', data);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
```

#### 3.2 Socket Client Hook

Create `hooks/useSocket.ts`:
```tsx
'use client'

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || '', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
```

### Phase 4: Core Chat Interface with Chakra UI

#### 4.1 Main Chat Layout

Create `components/ChatLayout.tsx`:
```tsx
'use client'

import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';

export function ChatLayout() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex height="100vh" overflow="hidden">
      {/* Conversation List Sidebar */}
      <Box
        width={{ base: '100%', md: '350px' }}
        borderRight="1px"
        borderColor="gray.200"
        display={{ base: isMobile ? 'block' : 'block', md: 'block' }}
      >
        <ConversationList />
      </Box>

      {/* Main Chat Area */}
      <Box flex="1" display={{ base: isMobile ? 'none' : 'block', md: 'block' }}>
        <ChatWindow />
      </Box>
    </Flex>
  );
}
```

#### 4.2 Conversation List Component

Create `components/ConversationList.tsx`:
```tsx
'use client'

import {
  Box,
  VStack,
  Heading,
  Input,
  List,
  ListItem,
  Avatar,
  Text,
  Badge,
} from '@chakra-ui/react';

interface Conversation {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount: number;
  isOnline: boolean;
}

export function ConversationList() {
  // Mock data - replace with actual data fetching
  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hello there!',
      unreadCount: 2,
      isOnline: true,
    },
    // Add more conversations...
  ];

  return (
    <Box height="100%" bg="white">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <Heading size="lg" mb={4}>Messages</Heading>
        <Input placeholder="Search conversations..." />
      </Box>

      {/* Conversations List */}
      <List spacing={0}>
        {conversations.map((conversation) => (
          <ListItem
            key={conversation.id}
            p={4}
            borderBottom="1px"
            borderColor="gray.100"
            _hover={{ bg: 'gray.50' }}
            cursor="pointer"
          >
            <Flex align="center" gap={3}>
              <Avatar
                name={conversation.name}
                size="md"
                position="relative"
              >
                {conversation.isOnline && (
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    w={3}
                    h={3}
                    bg="green.500"
                    borderRadius="full"
                    border="2px solid white"
                  />
                )}
              </Avatar>
              
              <Box flex="1">
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontWeight="semibold">{conversation.name}</Text>
                  <Text fontSize="sm" color="gray.500">12:30 PM</Text>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {conversation.lastMessage}
                  </Text>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge colorScheme="blue" borderRadius="full">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </Flex>
              </Box>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
```

#### 4.3 Chat Window Component

Create `components/ChatWindow.tsx`:
```tsx
'use client'

import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Input,
  Button,
  IconButton,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { SendHorizonal, Paperclip, Smile } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  sender: {
    username: string;
  };
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on('user_typing', () => setIsTyping(true));
    socket.on('user_stop_typing', () => setIsTyping(false));

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      content: newMessage,
      conversationId: 'current-conversation-id', // Replace with actual ID
      senderId: 'current-user-id', // Replace with actual user ID
      timestamp: new Date(),
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box height="100%" bg="white" display="flex" flexDirection="column">
      {/* Chat Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <HStack>
          <Avatar name="John Doe" size="md" />
          <Box>
            <Heading size="md">John Doe</Heading>
            <Text fontSize="sm" color="green.500">
              Online
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Messages Area */}
      <Box flex="1" overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.senderId === 'current-user-id' ? 'flex-end' : 'flex-start'}
              maxW="70%"
            >
              <Box
                bg={message.senderId === 'current-user-id' ? 'blue.500' : 'gray.100'}
                color={message.senderId === 'current-user-id' ? 'white' : 'black'}
                px={4}
                py={2}
                borderRadius="lg"
                borderTopLeftRadius={message.senderId === 'current-user-id' ? 'lg' : '0'}
                borderTopRightRadius={message.senderId === 'current-user-id' ? '0' : 'lg'}
              >
                <Text>{message.content}</Text>
                <Text
                  fontSize="xs"
                  color={message.senderId === 'current-user-id' ? 'blue.100' : 'gray.500'}
                  mt={1}
                  textAlign="right"
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            </Box>
          ))}
          
          {isTyping && (
            <Box alignSelf="flex-start">
              <Box
                bg="gray.100"
                px={4}
                py={2}
                borderRadius="lg"
                borderTopLeftRadius="0"
              >
                <Text fontStyle="italic" color="gray.500">
                  Typing...
                </Text>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Message Input */}
      <Box p={4} borderTop="1px" borderColor="gray.200">
        <HStack>
          <IconButton
            aria-label="Attach file"
            icon={<Paperclip size={18} />}
            variant="ghost"
          />
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            size="lg"
          />
          
          <IconButton
            aria-label="Add emoji"
            icon={<Smile size={18} />}
            variant="ghost"
          />
          
          <IconButton
            aria-label="Send message"
            icon={<SendHorizonal size={18} />}
            colorScheme="blue"
            onClick={handleSendMessage}
            isDisabled={!newMessage.trim()}
          />
        </HStack>
      </Box>
    </Box>
  );
}
```

### Phase 5: Authentication & Polish

#### 5.1 NextAuth Setup

Create `app/api/auth/[...nextauth]/route.ts`:
```tsx
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### 5.2 Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chat_app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# For production
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 🚀 Deployment Checklist

Before deploying to Vercel:

- [ ] Set up production database (Neon, Supabase, or Railway)
- [ ] Update environment variables in Vercel dashboard
- [ ] Run database migrations in production
- [ ] Configure CORS if needed
- [ ] Test real-time functionality in production
- [ ] Set up proper logging and monitoring

### 📱 Additional Features to Implement

1. **Message Status**: Read receipts, delivery status
2. **File Uploads**: Image, document sharing
3. **Voice Messages**: Record and send audio
4. **Video Calls**: WebRTC integration
5. **Message Search**: Search through conversation history
6. **Push Notifications**: For new messages
7. **Dark Mode**: Chakra UI theme customization

This guide provides a solid foundation for your chat app. Start with Phase 1 and progressively implement each component. The Chakra UI components will give you a professional-looking interface with minimal custom CSS.