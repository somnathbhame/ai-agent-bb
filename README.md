# Bingo AI Agents - Game Analysis Platform

A sophisticated React-based web application that simulates AI player agents to analyze game monetization, player behavior, and retention mechanics across different player segments.

## Overview

This platform uses AI agents to decode how games treat different player types, providing actionable insights for game developers, product managers, and analytics teams. Each AI agent represents a distinct player segment and reveals monetization strategies, progression gates, and personalized offers.

## Key Features

### 🤖 AI Agent Segments
- **5 distinct player personas**: Veteran Spender, New Regular, Whale, Feature-Engaged Non-Spender, and Casual Visitor
- **Detailed segment analysis** with lifetime value tracking and behavioral insights
- **Interactive agent cards** with custom profile art and statistics

### 📊 Analytics & Insights
- **Final Insights Panel**: Deep-dive analysis for each agent covering monetization, retention, gate progression, trigger events, and personalization
- **Monetize Charts**: Real-time visualization of spending patterns with colored performance zones
- **Gate Progression Tracking**: Video demos and metrics showing player progression depth
- **Segment-specific sales**: Visual representations of tailored offers for each player type

### 🎮 Game Intelligence
- **Competitor analysis** of 6+ major games (Coin Master, Monopoly GO!, Royal Match, Candy Crush Saga, etc.)
- **Revenue data** and market value insights
- **Feature mapping** and monetization decoding

### 📱 Case Study Section
- **Video demonstrations** of AI agents in action
- **Results showcase**: 60% cost reduction, 10× faster insights, 400+ automated tests
- **Real-world application examples** with embedded video content

### 🎄 Themed UI
- **Christmas-themed design** with snowfall effects on AI agents screen
- **Dynamic backgrounds** that change based on active tab
- **Smooth animations** and scroll-triggered reveals

### 📅 Demo Booking
- **Interactive calendar** for scheduling demos
- **Timezone selection** (India Standard Time support)
- **Available date highlighting** with intuitive day selection

## Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: CSS3 with custom animations and gradients
- **Build Tool**: Vite
- **Video**: HTML5 video with loop and autoplay support
- **Deployment**: Static site ready for Netlify/Vercel

## Project Structure

```
sticker-book/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── index.css            # Global styles and animations
│   │   └── main.jsx             # React entry point
│   ├── public/
│   │   ├── images/
│   │   │   ├── frontend-assets/  # UI backgrounds and logos
│   │   │   ├── agent-profiles/   # Agent profile images (AGENT_1-5.png)
│   │   │   ├── game-profiles/    # Competitor game images
│   │   │   ├── segmented-sale-1/ # Segment-specific sale images
│   │   │   └── segmented-sale-2/
│   │   └── videos/
│   │       ├── gate_demo.mp4     # Gate progression demo
│   │       └── asset_koyzJ1TVuEed1gZutFS77kEK.mp4  # Case study video
│   ├── package.json
│   └── vite.config.mjs
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern browser with ES6+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sticker-book
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## Features Breakdown

### Home Page
- Hero section with dynamic messaging based on active tab
- Marketing-style layout with scroll animations
- CTA buttons linking to AI agents and case studies

### AI Agents Tab
- Grid of 5 agent cards with custom panel art
- Click to view detailed Final Insights
- Snowfall animation overlay (Christmas theme)
- Background switches to `Outer_Background_Web.png`

### Final Insights Screen
- 6-section breakdown per agent:
  - Monetize (with chart and offer suggestions)
  - Retain
  - Gate progression (with clickable video demo)
  - Trigger events
  - Personalize offers
  - React to different player archetypes
- Back navigation to agents grid

### Gate Progression Chart
- Full-screen video player with looping gate demo
- Three-metric dashboard (Month/Week/Day stats with trend indicators)
- Color-coded performance zones

### Games Tab
- 6 competitor games with profile images
- Market value / revenue data
- Hover animations on game tiles

### Case Study Tab
- YouTube video embed (watch agents at work)
- Stormforge case study with local MP4 video player
- Results checklist (7 key benefits)
- Custom hero messaging

### Book a Demo Modal
- Calendar interface for December 2025
- Selectable available days (purple highlights)
- Timezone display
- Close button to dismiss

## Key Components

### `MonetizeChart`
SVG-based line chart with:
- Three colored background zones (good/mid/bad)
- Animated line path with data points
- Date and spending labels

### Agent Data Structure
```javascript
{
  id: 1,
  name: "Agent 1",
  segment: "Veteran Spender (13-Year Player)",
  lifetime_value_usd: 247.85,
  days_played: 4745,
  // ... additional fields
}
```

## Styling Highlights

- **Snowfall effect**: CSS `@keyframes` animation with radial gradients
- **Christmas red theme**: Applied to agent cards, borders, and accents
- **Responsive grids**: Auto-fit layouts for cards and game tiles
- **Custom backgrounds**: Dynamic switching via conditional class names
- **Video frames**: 16:9 aspect ratio containers with absolute positioning

## API Integration (Backend Ready)

The app is structured to fetch data from `/api/agents` and `/api/scenarios` endpoints. Currently uses static data but can easily integrate with a REST API or GraphQL backend.

## Environment Variables

No environment variables required for frontend-only deployment. For API integration, add:
```
VITE_API_BASE_URL=https://your-api-url.com
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

The app is ready for static deployment on:
- **Netlify**: `npm run build` → deploy `dist/` folder
- **Vercel**: Auto-detects Vite configuration
- **GitHub Pages**: Build and push `dist/` to `gh-pages` branch

## Performance Optimizations

- Lazy-loaded video content
- CSS animations with GPU acceleration
- Conditional rendering based on active stage/tab
- Minimal re-renders with React hooks

## Future Enhancements

- [ ] Backend API integration for real agent data
- [ ] Time slot selection in demo booking flow
- [ ] Form submission for demo requests
- [ ] Additional competitor games
- [ ] More player segment types
- [ ] Export insights as PDF reports

## Contributing

This is a private project. For questions or collaboration inquiries, use the "Talk to us" demo booking feature.

## License

Proprietary - All rights reserved.

---

**Built with ❤️ for game developers who want to decode player behavior and optimize monetization strategies.**
