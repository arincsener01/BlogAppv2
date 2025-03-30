# Blog App Frontend

This is the frontend application for the Blog App, built with React.

## Features

- Display, create, update, and delete blog posts
- User management
- Tag management
- Responsive design with Bootstrap
- Error handling and notifications

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Getting Started

1. Clone the repository
2. Navigate to the ClientApp directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/context` - React context for state management
  - `/pages` - Page components
  - `/services` - API services for backend communication

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from Create React App

## Connecting to the Backend

The application is configured to connect to the backend API at `https://localhost:5001/api`. You can modify this in `src/services/api.js` if your backend is running on a different URL.

## Error Handling and Notifications

The application includes comprehensive error handling and success notifications using:

1. React Context for global state management
2. React-Toastify for displaying notifications
3. Loading indicators for async operations

## License

MIT 