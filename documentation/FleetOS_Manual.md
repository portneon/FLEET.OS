# 🚌 FleetOS: The Simple Guide

Hello! This is the big book that explains how your magical bus app works. Imagine you are building a LEGO city—this guide explains all the pieces.

## 1. The Magical Book (The Database)
In your computer, there is a giant list called a **Database**. 
- **Prisma** is like a friendly librarian. 
- When we want to know "Which bus is Arjun driving?", we ask Prisma. 
- Prisma looks in the big book and tells us the answer.

## 2. The Door Guard (Authentication)
When you log in, the system checks your name and password.
- If they are correct, the guard gives you a **Secret Sticker** (called a Token).
- You keep this sticker in your pocket (`localStorage`).
- Every time you want to add a new bus, you show the sticker. If you don't have it, the guard says "No!"

## 3. The Map Maker (Transit & Routes)
Imagine drawing a line on a map with a crayon.
- **Routes** are the lines.
- **Stops** are the little circles where the bus pauses to pick up friends.
- We give each stop a number (1, 2, 3) so the bus doesn't get confused!

## 4. The Dispatcher (Trips)
This is like a teacher assigning seats.
- We pick a **Driver**, pick a **Bus**, and pick a **Route**.
- When the driver clicks "Start," the bus changes from **Sleeping (Idle)** to **Working (On Trip)**.
- When they click "End," the bus goes back to sleep and the driver is ready for a new job!

## 5. The Money Jar (Finance)
Every time a bus moves, it costs money for gas. But when people buy tickets, we get money!
- **Income:** Money coming into the jar.
- **Expense:** Money leaving the jar.
- The app does the math for you: `Leftover Money = Income - Expenses`.

---

## 🛠️ How it's built (For Grown-ups)

### The Backend (The Brain)
- **Node.js & Express:** The engine that runs the server.
- **TypeScript:** A "protective layer" that stops us from making silly spelling mistakes in code.
- **Prisma:** The bridge between our code and the MySQL database.

### The Frontend (The Controller)
- **Next.js:** The tool we used to build the website pages.
- **Tailwind CSS:** The "paint" we used to make it look luxury and pretty.
- **Lucide React:** The source of all the pretty icons (buses, maps, money).

### The Secret Handshake (API)
The Frontend talks to the Backend using the **API Central Client** (`lib/api.ts`). They send messages back and forth like letters in the mail!
