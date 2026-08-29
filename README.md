# Life Fitness Dashboard

A modern, responsive fitness dashboard built with **React + TypeScript + Vite**. It
visualizes daily health and activity metrics — steps, calories, active minutes,
heart rate, and sleep — and lets you log workouts that instantly update your
daily totals and goal progress.

## Features

- Summary stat cards for steps, calories, active minutes, resting heart rate, and sleep
- Weekly steps bar chart and intraday heart-rate area chart (powered by [Recharts](https://recharts.org/))
- Daily goal progress bars that react to logged activity
- Interactive **Log a Workout** form with live calorie estimation that updates today's totals and the recent-workouts feed

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vite.dev/) for dev server and builds
- [Recharts](https://recharts.org/) for data visualization
- [ESLint](https://eslint.org/) (flat config) for linting

## Getting started

Requires Node.js 20+ (Node 22 recommended) and npm.

```bash
npm ci        # install dependencies (or `npm install`)
npm run dev   # start the dev server at http://localhost:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5173 |
| `npm run build` | Type-check and build the production bundle to `dist/` |
| `npm run preview` | Preview the production build on port 4173 |
| `npm run lint` | Run ESLint over the project |
| `npm run typecheck` | Run the TypeScript compiler in no-emit mode |

## Project structure

```
src/
  components/        Reusable UI (stat cards, charts, workout log & form)
  data.ts            Seed activity data, goals, and calorie rates
  types.ts           Shared TypeScript types
  App.tsx            Dashboard layout and state
  main.tsx           App entry point
  index.css          Global styles / theme
```

## Cloud Agent environment

This repository includes a [`.cursor/environment.json`](.cursor/environment.json)
so Cursor Cloud Agents boot with dependencies installed (`npm ci`) and the Vite
dev server running automatically on port 5173.
