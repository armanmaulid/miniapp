# iOT EA Mini App

A fast, responsive Telegram Mini App built with React and Vite for monitoring and controlling MetaTrader 5 Expert Advisors (iOT EA). It interfaces with a Vercel-hosted backend to provide real-time status, equity charts, and remote control capabilities directly from Telegram.

## Features

- **Real-time Dashboard:** Monitor live equity curves, balance, open positions, and daily profit/loss.
- **Multi-Instance Support:** Seamlessly switch between multiple EA instances across different symbols and accounts (Real/Demo).
- **Remote Control:** Pause/resume trading, toggle trailing stops, and manage news filters on the fly.
- **Parameter Editing:** Quickly adjust risk percentage, take profit, stop loss, trading hours, and more.
- **Trade History:** View historical performance, win rates, and export trade data to CSV.
- **Telegram Native:** Optimized for the Telegram WebApp SDK, including native haptics, theme matching, and full-screen experience.

## Tech Stack

- **Framework:** React 18 + Vite
- **Charting:** Recharts (responsive equity visualization)
- **Integration:** Telegram WebApp SDK
- **Styling:** CSS Modules with dark mode focus

## Environment Variables

Create a `.env` file in the root directory (based on `.env.example`) or configure them in your Vercel Dashboard:

```env
VITE_API_URL=https://iot-ea-backend.vercel.app
VITE_EA_TOKEN=your_secret_token
```

> **Note:** `VITE_EA_TOKEN` must match the `EA_SECRET_TOKEN` configured in the backend and the `WebPushToken` input in the MT5 EA.

## Development Local

```bash
# Clone the repository
git clone https://github.com/USERNAME/iot-ea-miniapp.git
cd iot-ea-miniapp

# Install dependencies
npm install

# Start the development server
npm run dev &
```

## Deployment

This app is optimized for deployment on Vercel.

1. Import the repository in your Vercel Dashboard.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add the necessary Environment Variables.

## MT5 Setup

1. In MetaTrader 5, go to **Tools → Options → Expert Advisors**.
2. Check **Allow WebRequest for listed URL**.
3. Add the backend URL: `https://iot-ea-backend.vercel.app`.
4. When attaching the EA, set the `WebPushToken` input to your secret token.

## Telegram Bot Setup

In BotFather, use the `/setmenubutton` command to link the Mini App:

```text
/setmenubutton
@YourBotName
iOT Dashboard
https://your-vercel-deployment.vercel.app
```
