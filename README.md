# iOT EA Mini App

Telegram Mini App untuk monitoring dan kontrol iOT EA dari MetaTrader 5.

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
cd iot-ea-miniapp
git init
git add .
git commit -m "init: iOT EA Mini App"
git remote add origin https://github.com/USERNAME/iot-ea-miniapp.git
git push -u origin main
```

### 2. Import di Vercel
1. Buka https://vercel.com/new
2. Import repo `iot-ea-miniapp`
3. Framework: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

### 3. Tambah Environment Variables
Di Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL   = https://iot-ea-backend.vercel.app
VITE_EA_TOKEN  = (sama dengan EA_SECRET_TOKEN di backend Vercel)
```

### 4. Setup Telegram Bot
Di BotFather:
```
/setmenubutton
@NamaBotKamu
iOT Dashboard
https://iot-ea-miniapp.vercel.app
```

### 5. MT5 Setup
- Tools → Options → Expert Advisors → Allow WebRequest
- Tambah URL: `https://iot-ea-backend.vercel.app`
- Input EA: `WebPushToken` = token yang sama

## Development Local
```bash
cp .env.example .env
# edit .env dengan token yang benar
npm install
npm run dev
```

## Tech Stack
- React 18 + Vite
- Recharts (equity chart)
- Telegram WebApp SDK
- CSS Modules
