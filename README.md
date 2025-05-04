# SearchIt - Image Marketplace Application

SearchIt is a full-stack image marketplace application that allows users to search, upload, download, and purchase images.

## Features

- **User Authentication**: Register, login, and user profiles
- **Image Upload**: Upload images with titles, descriptions, categories, and pricing
- **Search Functionality**: Search images by keyword or browse by category
- **Image Purchase**: Buy images with simple checkout process
- **User Profiles**: Track downloaded and purchased images
- **Responsive Design**: Works on all device sizes

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Shadcn UI Components

### Backend
- Flask (Python)
- JWT Authentication
- RESTful API

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Local Development

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```
   cd backend
   python run.py
   ```
5. Start the frontend development server:
   ```
   npm run dev
   ```
6. Open http://localhost:3000 in your browser

## Authentication

The application includes a complete authentication system:
- Register new accounts
- Login with email and password
- JWT token-based authentication
- Protected routes for authenticated users