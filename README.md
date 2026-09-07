# FME - Policy Proposal Intake Manager

A responsive web application for managing policy proposals, built with React, TypeScript, and Bootstrap.

## Features

- **Responsive Design**: Works seamlessly across Desktop, Laptop, iPad, and Mobile devices
- **Modern UI**: Built with React Bootstrap for a clean, professional interface
- **Type Safety**: Written in TypeScript for better code quality and developer experience
- **Fast Development**: Powered by Vite for lightning-fast hot module replacement (HMR)
- **Routing**: React Router for seamless navigation between pages

## Tech Stack

- **React** 19.2.6 (Latest Stable)
- **TypeScript** 6.0.2
- **Vite** 8.0.12
- **Bootstrap** 5.3.8
- **React Bootstrap** 2.10.10
- **React Router** 7.15.1

## Project Structure

```
FMEssentials.UI/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── App.css              # Application styles
│   ├── index.css            # Global styles
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Home page
│   │   └── Dashboard.tsx    # Dashboard page
│   └── components/          # Reusable components (ready for expansion)
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Available Pages

- **Home** (`/`): Landing page with overview of features
- **Dashboard** (`/dashboard`): View and manage policy proposals

## Responsive Breakpoints

The application is optimized for the following device sizes:

- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **iPad/Small Desktop**: 768px - 992px
- **Desktop**: 992px - 1200px
- **Large Desktop**: > 1200px

## Customization

### Adding New Pages

1. Create a new component in `src/pages/`
2. Import and add a route in `src/App.tsx`
3. Add navigation link in the Navbar component

### Styling

- Global styles: `src/index.css`
- Component styles: `src/App.css`
- Bootstrap customization: Modify Bootstrap imports in `src/main.tsx`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2026 FME - Policy Proposal Intake Manager. All rights reserved.

