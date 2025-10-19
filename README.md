# 🌦️ Weather Application

A sleek and minimal **React + TypeScript** weather web app built with **Vite**.  
It allows users to search for cities, view detailed weather conditions, and enjoy a fast, responsive UI powered by modern frontend tools.

---

## ✨ Features

- 🌤 **Current Weather:** Real-time temperature, humidity, and wind speed
- 🔍 **City Search:** Quickly find any location
- 📍 **Geolocation Support:** Detects your current city automatically
- 💾 **Favorites (optional):** Save and manage preferred cities in localStorage
- ⚡ **Fast & Lightweight:** Built on top of Vite for instant updates and HMR
- 🎨 **Clean UI:** Responsive and elegant interface

---

## 🧠 Tech Stack

| Category | Technologies                   |
|-----------|--------------------------------|
| Framework | React 18 + TypeScript          |
| Build Tool | Vite                           |
| Styling | Tailwind CSS + Shadcn          |
| State/Data | React Query + Custom Hooks     |
| Testing | Vitest + React Testing Library |
| Code Quality | ESLint + Prettier              |

---

## ⚙️ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/ISleep11/Weather-Application.git
cd Weather-Application

# 2. Install dependencies
npm install

# 3. Create an .env file in the root directory
VITE_WEATHER_API_KEY=your_openweather_api_key

# 4. Start the development server
npm run dev

# 5. Build for production
npm run build

# 6. Preview the production build locally
npm run preview
```

---

## 🗂️ Project Structure
```bash
src/
 ├── api/               # API logic (fetching weather data)
 ├── components/        # Reusable UI components
 ├── hooks/             # Custom React hooks (useWeather, useGeolocation, etc.)
 ├── pages/             # Main pages (Home, Favorites, etc.)
 └── main.tsx           # Application entry point
```

---

## 🌍 API Reference

This project uses the OpenWeatherMap API to retrieve weather data.
You can register for a free API key at https://openweathermap.org/api
.

### Example endpoint:

- GET /data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric

### Returned data includes:
- Temperature and “feels like”
- Humidity and wind speed
- City name and coordinates
- Weather description and icon code

---

## 🧪 Testing

This project uses Vitest and React Testing Library for unit and integration tests.

```bash
# To run all tests
npm run test
```

---

## 🚀 Roadmap / Future Improvements
- 📱 PWA support for offline access
- 🌐 Multi-language support (EN / UA)
- ⚙️ Backend integration for user profiles