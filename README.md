# ZOGStore UI

A modern e-commerce frontend application built with React and Vite.

## Overview

ZOGStore UI is a responsive web application that provides a seamless shopping experience for customers. It features product browsing, cart management, user authentication, and checkout process.

## Features

- Product catalog with search and filtering
- User authentication and profile management
- Shopping cart functionality
- Responsive design for mobile and desktop
- Order history and tracking

## Tech Stack

- React 18+
- Vite
- React Router
- Context API for state management
- CSS Modules/Styled Components

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

1. Clone the repository

   ```
   git clone https://github.com/ajmalrazaqbhatti/ZOGStore.git
   cd ZOGStoreUI
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Start the development server

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
ZOGStoreUI/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable UI components
│   ├── context/     # React context for state management
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Page components
│   ├── services/    # API service functions
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Main App component
│   └── main.jsx     # Application entry point
├── .eslintrc.cjs    # ESLint configuration
├── index.html       # HTML template
├── package.json     # Project dependencies and scripts
└── vite.config.js   # Vite development configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Contributing

Please read our contribution guidelines before submitting a pull request. This project is for development purposes only.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
