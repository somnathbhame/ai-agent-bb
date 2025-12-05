import React, { useEffect, useRef, useState } from 'react'
import VoiceAssistant from './components/VoiceAssistant'
import { API_ENDPOINTS } from './config'

const MonetizeChart = ({ series }) => {
  if (!series || series.length === 0) return null

  const values = series.map((point) => point.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const lastPoint = series[series.length - 1]
  const chartHeight = 40
  const paddingTop = 4
  const paddingBottom = 4
  const drawableHeight = chartHeight - paddingTop - paddingBottom

  const buildY = (value) =>
    paddingTop + (1 - (value - min) / range) * drawableHeight

  const pathD = series
    .map((point, index) => {
      const x = series.length === 1 ? 0 : (index / (series.length - 1)) * 100
      const y = buildY(point.value)
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')

  return (
    <div className="monetize-chart">
      <svg
        className="monetize-chart-svg"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        <rect
          className="chart-zone-bad"
          x="0"
          y="30"
          width="100"
          height="10"
        />
        <rect
          className="chart-zone-mid"
          x="0"
          y="20"
          width="100"
          height="10"
        />
        <rect
          className="chart-zone-good"
          x="0"
          y="10"
          width="100"
          height="10"
        />
        <line className="chart-axis" x1="0" y1="38" x2="100" y2="38" />
        <line className="chart-axis" x1="2" y1="2" x2="2" y2="38" />
        <path d={pathD} className="monetize-chart-line" />
        {series.map((point, index) => {
          const x = series.length === 1 ? 0 : (index / (series.length - 1)) * 100
          const y = buildY(point.value)
          return (
            <circle
              key={`${point.date}-${index}`}
              className="monetize-chart-point"
              cx={x}
              cy={y}
              r={1.2}
            />
          )
        })}
      </svg>
      <div className="monetize-chart-meta">
        <span className="monetize-chart-date">{lastPoint.date}</span>
        <span className="monetize-chart-value">
          ${lastPoint.value.toFixed(2)} spent
        </span>
      </div>
    </div>
  )
}

function App() {
  const [agents, setAgents] = useState([])
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [stage, setStage] = useState('home')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(null)
  const [agentsExplainerVisible, setAgentsExplainerVisible] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [selectedDemoDay, setSelectedDemoDay] = useState(null)
  const [insightView, setInsightView] = useState('insights') // 'insights' or 'monetize'
  const [selectedGame, setSelectedGame] = useState(null)
  const agentsExplainerRef = useRef(null)

  const goHome = () => {
    setStage('home')
    setSelectedAgent(null)
    setSelectedSegmentIndex(null)
    setSelectedGame(null)
    setInsightView('insights')
  }

  const AGENT_SEGMENT_LABEL_MAP = {
    1: 'Veteran Spender (13-Year Player)',
    2: 'New Regular (7-30 Day Player)',
    3: 'Whale 90D ($100+ Spender)',
    4: 'Feature-Engaged Non-Spender',
    5: 'Casual Visitor',
  }

  const getAgentSegmentLabel = (agent) =>
    (agent && AGENT_SEGMENT_LABEL_MAP[agent.id]) || agent?.segment

  const AGENT_PROFILE_PANEL_IMAGE_MAP = {
    1: '/images/agent-profiles/AGENT_1.png',
    2: '/images/agent-profiles/AGENT_2.png',
    3: '/images/agent-profiles/AGENT_3.png',
    4: '/images/agent-profiles/AGENT_4.png',
    5: '/images/agent-profiles/AGENT_5.png',
  }

  const getAgentPanelImageUrl = (agent) =>
    (agent && AGENT_PROFILE_PANEL_IMAGE_MAP[agent.id]) || undefined

  const AGENT_FINAL_INSIGHT_MAP = {
    1: 'High-value veteran spender – ideal for premium upsell flows.',
    2: 'New regular player – focus on onboarding and habit-building offers.',
    3: 'Recent whale – protect engagement with VIP-style value bundles.',
    4: 'Feature-engaged non-spender – test low-friction starter packs.',
    5: 'Casual visitor – lightweight hooks to bring them back more often.',
  }

  const getAgentFinalInsight = (agent) =>
    (agent && AGENT_FINAL_INSIGHT_MAP[agent.id]) || ''

  const AGENT_FINAL_INSIGHT_DETAILS_MAP = {
    1: [
      {
        title: 'Monetize',
        body:
          'Use premium bundles, VIP passes, and cosmetic upgrades; avoid heavy discounts so value feels prestigious.',
        offers: [
          { label: 'Veteran booster pack', price: 3.99 },
          { label: 'VIP diamond bundle', price: 9.99 },
          { label: 'Elite room access', price: 19.99 },
        ],
      },
      {
        title: 'Retain',
        body:
          'Lean on long-term streak rewards, veteran-only events, and recognition of 13-year tenure to keep them coming back.',
      },
      {
        title: 'Gate progression',
        body:
          'Gate via higher-bet rooms and elite leagues rather than hard paywalls; always show a clear next milestone.',
      },
      {
        title: 'Trigger events',
        body:
          'Trigger offers after long sessions, big wins, or when they return after a short break to celebrate commitment.',
      },
      {
        title: 'Personalize offers',
        body:
          'Highlight exclusive veteran bundles with strong perceived value and loyalty messaging instead of generic sales.',
      },
      {
        title: 'React to different player archetypes',
        body:
          'Treat as a high-spend achiever; emphasize mastery, challenge, and status rewards over simple discounts.',
      },
    ],
    2: [
      {
        title: 'Monetize',
        body:
          'Start with low-price starter packs and first-purchase bonuses that feel safe and easy to understand.',
        offers: [
          { label: 'Starter coin pack', price: 0.99 },
          { label: 'Beginner value bundle', price: 1.99 },
          { label: 'New regular booster', price: 4.99 },
        ],
      },
      {
        title: 'Retain',
        body:
          'Build habit with daily goals, simple missions, and early streak rewards in the first 7–30 days.',
      },
      {
        title: 'Gate progression',
        body:
          'Use gentle gates that teach meta-systems; always keep a free path so they can learn without pressure.',
      },
      {
        title: 'Trigger events',
        body:
          'Show education-focused offers after tutorial completion, first session loss streaks, and 3/7-day return points.',
      },
      {
        title: 'Personalize offers',
        body:
          'Bundle progression boosts with protection (extra lives, safety nets) to reduce fear of making a bad purchase.',
      },
      {
        title: 'React to different player archetypes',
        body:
          'Treat as an exploring learner; keep copy friendly, guided, and focused on “try this next” suggestions.',
      },
    ],
    3: [
      {
        title: 'Monetize',
        body:
          'Offer high-value bundles, VIP tiers, and limited-time premium packs calibrated for $100+ spenders.',
        offers: [
          { label: 'Whale room bundle', price: 9.99 },
          { label: 'High-roller pack', price: 19.99 },
          { label: 'Mega VIP sale', price: 49.99 },
        ],
      },
      {
        title: 'Retain',
        body:
          'Use VIP programs, surprise gifts, and early access to new features to make them feel recognized and valued.',
      },
      {
        title: 'Gate progression',
        body:
          'Unlock high-end rooms, events, and cosmetics as new spend targets so there is always another prestige goal.',
      },
      {
        title: 'Trigger events',
        body:
          'Trigger premium offers after big purchases, marathon sessions, and when data suggests drop in engagement.',
      },
      {
        title: 'Personalize offers',
        body:
          'Curate bundles around their favorite modes with clear power upgrades and time-saving value.',
      },
      {
        title: 'React to different player archetypes',
        body:
          'Treat as a competitive power user; highlight exclusivity, leaderboard position, and limited slots.',
      },
    ],
    4: [
      {
        title: 'Monetize',
        body:
          'Experiment with very low entry price points, optional ads, or soft-currency sinks instead of hard pay asks.',
        offers: [
          { label: 'Feature ticket sampler', price: 0.99 },
          { label: 'Low-friction starter pack', price: 1.99 },
          { label: 'Season pass upgrade', price: 9.99 },
        ],
      },
      {
        title: 'Retain',
        body:
          'Double down on the features they already love with themed events, collections, and progression tracks.',
      },
      {
        title: 'Gate progression',
        body:
          'Use time or energy gates but always pair them with free alternatives so non-spenders do not feel blocked.',
      },
      {
        title: 'Trigger events',
        body:
          'Trigger gentle upsell moments after feature milestones and when they run out of resources in favorite modes.',
      },
      {
        title: 'Personalize offers',
        body:
          'Offer cosmetic or feature-focused packs that enhance the experience without forcing payment to continue.',
      },
      {
        title: 'React to different player archetypes',
        body:
          'Treat as a value-seeking explorer; keep messaging optional, respectful, and focused on “support the feature you love.”',
      },
    ],
    5: [
      {
        title: 'Monetize',
        body:
          'Avoid strong sales pressure; only show ultra-light starter offers once they demonstrate repeat engagement.',
        offers: [
          { label: 'Comeback coins pack', price: 0.99 },
          { label: 'Lightweight fun bundle', price: 2.99 },
        ],
      },
      {
        title: 'Retain',
        body:
          'Use easy re-entry points, quick-play modes, and light reminders so casual sessions feel low effort.',
      },
      {
        title: 'Gate progression',
        body:
          'Keep early progression almost ungated so they can explore without friction or commitment.',
      },
      {
        title: 'Trigger events',
        body:
          'Trigger welcome-back flows after long breaks and only occasional offers during early sessions.',
      },
      {
        title: 'Personalize offers',
        body:
          'Focus on comeback bundles and “jump back in” packs that quickly restore them to a fun state.',
      },
      {
        title: 'React to different player archetypes',
        body:
          'Treat as a drop-in guest; optimize for frictionless fun first, then light monetization once engagement grows.',
      },
    ],
  }

  const getAgentFinalInsightDetails = (agent) =>
    (agent && AGENT_FINAL_INSIGHT_DETAILS_MAP[agent.id]) || []

  const AGENT_MONETIZE_SERIES_MAP = {
    1: [
      { date: '2025-10-28', value: 4.2 },
      { date: '2025-10-29', value: 4.8 },
      { date: '2025-10-30', value: 5.1 },
      { date: '2025-10-31', value: 7.3 },
      { date: '2025-11-01', value: 6.9 },
    ],
    2: [
      { date: '2025-10-28', value: 0.7 },
      { date: '2025-10-29', value: 0.8 },
      { date: '2025-10-30', value: 1.1 },
      { date: '2025-10-31', value: 1.4 },
      { date: '2025-11-01', value: 1.3 },
    ],
    3: [
      { date: '2025-10-28', value: 3.5 },
      { date: '2025-10-29', value: 4.0 },
      { date: '2025-10-30', value: 4.4 },
      { date: '2025-10-31', value: 6.2 },
      { date: '2025-11-01', value: 5.8 },
    ],
    4: [
      { date: '2025-10-28', value: 0.3 },
      { date: '2025-10-29', value: 0.4 },
      { date: '2025-10-30', value: 0.45 },
      { date: '2025-10-31', value: 0.6 },
      { date: '2025-11-01', value: 0.55 },
    ],
    5: [
      { date: '2025-10-28', value: 0.2 },
      { date: '2025-10-29', value: 0.25 },
      { date: '2025-10-30', value: 0.3 },
      { date: '2025-10-31', value: 0.5 },
      { date: '2025-11-01', value: 0.47 },
    ],
  }

  const getAgentMonetizeSeries = (agent) =>
    (agent && AGENT_MONETIZE_SERIES_MAP[agent.id]) || []

  const AGENT_PROGRESSION_SERIES_MAP = {
    1: [
      { date: '2025-10-01', value: 1 },
      { date: '2025-10-07', value: 3 },
      { date: '2025-10-14', value: 5 },
      { date: '2025-10-21', value: 7 },
      { date: '2025-10-28', value: 9 },
    ],
    2: [
      { date: '2025-10-01', value: 1 },
      { date: '2025-10-07', value: 2 },
      { date: '2025-10-14', value: 3 },
      { date: '2025-10-21', value: 4 },
      { date: '2025-10-28', value: 5 },
    ],
    3: [
      { date: '2025-10-01', value: 2 },
      { date: '2025-10-07', value: 4 },
      { date: '2025-10-14', value: 6 },
      { date: '2025-10-21', value: 8 },
      { date: '2025-10-28', value: 10 },
    ],
    4: [
      { date: '2025-10-01', value: 1 },
      { date: '2025-10-07', value: 1.5 },
      { date: '2025-10-14', value: 2 },
      { date: '2025-10-21', value: 2.5 },
      { date: '2025-10-28', value: 3 },
    ],
    5: [
      { date: '2025-10-01', value: 0.5 },
      { date: '2025-10-07', value: 1 },
      { date: '2025-10-14', value: 1.25 },
      { date: '2025-10-21', value: 1.5 },
      { date: '2025-10-28', value: 1.75 },
    ],
  }

  const getAgentProgressionSeries = (agent) =>
    (agent && AGENT_PROGRESSION_SERIES_MAP[agent.id]) || []

  const AGENT_GATE_SUMMARY_MAP = {
    1: {
      month: { label: 'Current month gate clear rate', value: '82%', trend: 'up' },
      week: { label: 'This week ARPDAU', value: '$1.45', trend: 'up' },
      day: { label: 'Today hard-gate drop-off', value: '12%', trend: 'down' },
    },
    2: {
      month: { label: 'Current month gate clear rate', value: '64%', trend: 'up' },
      week: { label: 'This week ARPDAU', value: '$0.65', trend: 'up' },
      day: { label: 'Today tutorial exit at gate', value: '18%', trend: 'down' },
    },
    3: {
      month: { label: 'Current month gate clear rate', value: '91%', trend: 'up' },
      week: { label: 'This week ARPDAU', value: '$2.40', trend: 'up' },
      day: { label: 'Today mid-session churn at gate', value: '7%', trend: 'down' },
    },
    4: {
      month: { label: 'Current month gate clear rate', value: '58%', trend: 'down' },
      week: { label: 'This week ARPDAU', value: '$0.40', trend: 'flat' },
      day: { label: 'Today feature-gate exit', value: '22%', trend: 'down' },
    },
    5: {
      month: { label: 'Current month gate clear rate', value: '47%', trend: 'down' },
      week: { label: 'This week ARPDAU', value: '$0.18', trend: 'flat' },
      day: { label: 'Today comeback gate reach', value: '9%', trend: 'up' },
    },
  }

  const getAgentGateSummary = (agent) =>
    (agent && AGENT_GATE_SUMMARY_MAP[agent.id]) || null

  const SEGMENT1_IMAGE_MAP = {
    1: '/images/segmented-sale-1/agent_1_Segment_1 Sale, Veteran Spender (13-Year Player).png',
    2: '/images/segmented-sale-1/agent_2_Segment_1 Sale,  New Regular (7–30 Day Player).png',
    3: '/images/segmented-sale-1/agent_3_Segment_1 Sale, Whale 90D ($100+ Spender)_.png',
    4: '/images/segmented-sale-1/agent_4_Segment_1 Sale, Feature-Engaged_Non-Spender.png',
    5: '/images/segmented-sale-1/agent_5_Segment_1 Sale, Casual Visitor.png',
  }

  const SEGMENT2_IMAGE_MAP = {
    1: '/images/segmented-sale-2/agent_1_Segment_2 Sale,  New Regular (7–30 Day Player)-1.png',
    2: '/images/segmented-sale-2/agent_2_Segment_2 Sale,  New Regular (7–30 Day Player).png',
    3: '/images/segmented-sale-2/agent_3_Segment_2 Sale, Whale 90D ($100+ Spender).png',
    4: '/images/segmented-sale-2/agent_4_Segment_2 Sale, Feature-Engaged_Non-Spender.png',
    5: '/images/segmented-sale-2/agent_5_Segment_2 Sale, Casual Visitor.png',
  }

  const getSegmentImageUrl = (agent, segmentIndex) => {
    if (!agent) return undefined
    const map = segmentIndex === 1 ? SEGMENT1_IMAGE_MAP : SEGMENT2_IMAGE_MAP
    return map[agent.id]
  }

  // Get purchase data for segmented sales
  const getSegmentPurchaseData = (agent, segmentIndex) => {
    if (!agent) return []
    
    const segment1Data = {
      1: [ // Veteran Spender
        { offer: 'VIP Diamond Bundle', oldPrice: 280, newPrice: 300, purchased: true, discount: '50% OFF' },
        { offer: 'Elite Room Access', oldPrice: 499, newPrice: 599, purchased: true, discount: 'LIMITED' },
      ],
      2: [ // New Whale
        { offer: 'Starter Mega Pack', oldPrice: 99, newPrice: 149, purchased: true, discount: '2X VALUE' },
        { offer: 'Premium Boost', oldPrice: 299, newPrice: 399, purchased: true, discount: 'BEST DEAL' },
      ],
      3: [ // New F2P
        { offer: 'Welcome Bundle', oldPrice: 49, newPrice: 99, purchased: false, discount: '50% OFF' },
        { offer: 'Starter Pack', oldPrice: 29, newPrice: 49, purchased: false, discount: 'NEW PLAYER' },
      ],
      4: [ // Feature Lover
        { offer: 'Collection Booster', oldPrice: 149, newPrice: 199, purchased: true, discount: 'POPULAR' },
        { offer: 'Event Pass', oldPrice: 199, newPrice: 249, purchased: false, discount: 'LIMITED TIME' },
      ],
      5: [ // Dormant Returner
        { offer: 'Welcome Back Offer', oldPrice: 99, newPrice: 149, purchased: true, discount: 'COMEBACK' },
        { offer: 'Reactivation Pack', oldPrice: 199, newPrice: 249, purchased: false, discount: '40% OFF' },
      ],
    }

    const segment2Data = {
      1: [ // Veteran Spender
        { offer: 'Veteran Booster Pack', oldPrice: 399, newPrice: 499, purchased: true, discount: 'EXCLUSIVE' },
        { offer: 'Loyalty Reward', oldPrice: 299, newPrice: 349, purchased: true, discount: 'VIP ONLY' },
      ],
      2: [ // New Whale
        { offer: 'Power Bundle', oldPrice: 249, newPrice: 349, purchased: true, discount: '3X VALUE' },
        { offer: 'Mega Coins Pack', oldPrice: 499, newPrice: 599, purchased: true, discount: 'HOT DEAL' },
      ],
      3: [ // New F2P
        { offer: 'Daily Deal', oldPrice: 19, newPrice: 29, purchased: false, discount: 'DAILY' },
        { offer: 'Mini Bundle', oldPrice: 49, newPrice: 79, purchased: false, discount: 'SAVE 40%' },
      ],
      4: [ // Feature Lover
        { offer: 'Feature Unlock', oldPrice: 199, newPrice: 249, purchased: true, discount: 'NEW' },
        { offer: 'Theme Collection', oldPrice: 149, newPrice: 199, purchased: false, discount: 'TRENDING' },
      ],
      5: [ // Dormant Returner
        { offer: 'Re-entry Bundle', oldPrice: 149, newPrice: 199, purchased: true, discount: 'SPECIAL' },
        { offer: 'Quick Start Pack', oldPrice: 99, newPrice: 149, purchased: false, discount: 'BONUS' },
      ],
    }

    const dataMap = segmentIndex === 1 ? segment1Data : segment2Data
    return dataMap[agent.id] || []
  }

  const DEMO_DAYS = Array.from({ length: 31 }, (_, index) => index + 1)
  const DEMO_AVAILABLE_DAYS = [
    5, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 29,
    30, 31,
  ]

  const COMPETITOR_GAMES = [
    {
      id: 'frenzy',
      title: 'Frenzy Bingo',
      subtitle: 'Live-ops driven bingo with frequent events and jackpots.',
      colorClass: 'game-card-purple',
      image: '/images/game-profiles/frenzy.webp',
      marketValue: 'Emerging title – revenue not yet public',
      metrics: {
        dau: '5.38k',
        dauChange: '+1.24%',
        playtime: '12m 38s',
        playtimeChange: '+0.54%',
        newUsers: '3.34k',
        newUsersChange: '+8.05%',
        sessions: '9.77k',
        sessionsChange: '+4.16%',
      }
    },
    {
      id: 'bingo-voyage',
      title: 'Bingo Voyage',
      subtitle: 'Travel-themed bingo adventure with map-based progression.',
      colorClass: 'game-card-blue',
      image: '/images/game-profiles/Bingo Voyage.1.webp',
      marketValue: 'New launch – revenue estimates not public',
      metrics: {
        dau: '8.12k',
        dauChange: '+2.45%',
        playtime: '15m 22s',
        playtimeChange: '+1.32%',
        newUsers: '4.87k',
        newUsersChange: '+12.5%',
        sessions: '12.4k',
        sessionsChange: '+6.82%',
      }
    },
    {
      id: 'coin-master',
      title: 'Coin Master',
      subtitle: 'Slots + base-building with strong social loops.',
      colorClass: 'game-card-gold',
      image: '/images/game-profiles/Coin Master.webp',
      marketValue: '≈ $6B+ lifetime player spend',
      metrics: {
        dau: '42.6k',
        dauChange: '+3.18%',
        playtime: '18m 45s',
        playtimeChange: '+2.14%',
        newUsers: '18.2k',
        newUsersChange: '+9.42%',
        sessions: '68.5k',
        sessionsChange: '+5.27%',
      }
    },
    {
      id: 'monopoly-go',
      title: 'Monopoly GO!',
      subtitle: 'Board progression with aggressive event cadence.',
      colorClass: 'game-card-green',
      image: '/images/game-profiles/Monopoly Go.webp',
      marketValue: '≈ $3.2B lifetime player spend',
      metrics: {
        dau: '35.8k',
        dauChange: '+4.67%',
        playtime: '22m 15s',
        playtimeChange: '+3.45%',
        newUsers: '15.6k',
        newUsersChange: '+11.2%',
        sessions: '54.3k',
        sessionsChange: '+7.89%',
      }
    },
    {
      id: 'royal-match',
      title: 'Royal Match',
      subtitle: 'Match-3 puzzle with smooth monetization ramps.',
      colorClass: 'game-card-pink',
      image: '/images/game-profiles/Royal Match.webp',
      marketValue: '≈ $3B lifetime player spend',
      metrics: {
        dau: '28.9k',
        dauChange: '+2.91%',
        playtime: '16m 52s',
        playtimeChange: '+1.78%',
        newUsers: '12.4k',
        newUsersChange: '+8.76%',
        sessions: '45.7k',
        sessionsChange: '+5.43%',
      }
    },
    {
      id: 'candy-crush',
      title: 'Candy Crush Saga',
      subtitle: 'Classic match-3 with a massive level catalog.',
      colorClass: 'game-card-silver',
      image: '/images/game-profiles/candy crush Saga.webp',
      marketValue: '> $20B lifetime player spend',
      metrics: {
        dau: '52.3k',
        dauChange: '+1.89%',
        playtime: '24m 12s',
        playtimeChange: '+2.67%',
        newUsers: '21.8k',
        newUsersChange: '+7.34%',
        sessions: '89.2k',
        sessionsChange: '+4.92%',
      }
    },
  ]

  useEffect(() => {
    if (!agentsExplainerRef.current || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAgentsExplainerVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(agentsExplainerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [agentsRes, scenariosRes] = await Promise.all([
          fetch(API_ENDPOINTS.agents),
          fetch(API_ENDPOINTS.scenarios),
        ])

        if (!agentsRes.ok || !scenariosRes.ok) {
          throw new Error('API request failed')
        }

        const [agentsJson, scenariosJson] = await Promise.all([
          agentsRes.json(),
          scenariosRes.json(),
        ])

        setAgents(agentsJson)
        setScenarios(scenariosJson)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load data from backend')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (stage === 'loading') {
      const timer = setTimeout(() => {
        setStage('lobby')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [stage])

  useEffect(() => {
    if (stage === 'lobby') {
      const timer = setTimeout(() => {
        setStage('segments')
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [stage])

  return (
    <div className={`app ${activeTab === 'agents' ? 'app-agents' : ''}`}>
      <VoiceAssistant stage={stage} setStage={setStage} setActiveTab={setActiveTab} />
      {isDemoOpen && (
        <div className="demo-overlay">
          <div className="demo-modal">
            <h2 className="demo-title">Book a Demo</h2>
            <div className="demo-calendar-section">
              <h3 className="demo-calendar-heading">Select a Day</h3>
              <div className="demo-month-row">
                <button
                  type="button"
                  className="demo-month-nav"
                  aria-label="Previous month"
                >
                  
                </button>
                <span className="demo-month-label">December 2025</span>
                <button
                  type="button"
                  className="demo-month-nav"
                  aria-label="Next month"
                >
                  
                </button>
              </div>
              <div className="demo-weekdays-row">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span>SUN</span>
              </div>
              <div className="demo-calendar-grid">
                {DEMO_DAYS.map((day) => {
                  const isAvailable = DEMO_AVAILABLE_DAYS.includes(day)
                  const isSelected = selectedDemoDay === day
                  const dayClassNames = [
                    'demo-day',
                    isAvailable ? 'demo-day-available' : 'demo-day-unavailable',
                    isSelected ? 'demo-day-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <div key={day} className={dayClassNames}>
                      {isAvailable ? (
                        <button
                          type="button"
                          className="demo-day-button"
                          onClick={() => setSelectedDemoDay(day)}
                        >
                          {day}
                        </button>
                      ) : (
                        <span className="demo-day-label">{day}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="demo-timezone-row">
              <div className="demo-timezone-label">Time zone</div>
              <div className="demo-timezone-value">
                <span className="demo-timezone-dot" />
                <span>India Standard Time (UTC+05:30)</span>
              </div>
            </div>
            <div className="demo-footer">
              <button
                type="button"
                className="demo-close-button"
                onClick={() => setIsDemoOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="header">
        <div
          className="header-left"
          onClick={() => {
            setActiveTab('home')
            goHome()
          }}
        >
          <img
            src="/images/frontend-assets/Scopely_logo.png"
            alt="Scopely logo"
            className="brand-logo"
          />
          <span className="brand-name">Bingo AI Agents</span>
        </div>
        <div className="header-right">
          <nav className="header-nav">
            <button
              type="button"
              className={`header-link ${activeTab === 'home' ? 'header-link-active' : ''}`}
              onClick={() => {
                setActiveTab('home')
                goHome()
              }}
            >
              Home
            </button>
            <button
              type="button"
              className={`header-link ${activeTab === 'agents' ? 'header-link-active' : ''}`}
              onClick={() => {
                setActiveTab('agents')
                setStage('agents')
                setSelectedAgent(null)
                setSelectedSegmentIndex(null)
                setInsightView('insights')
              }}
            >
              AI agents
            </button>
            <button
              type="button"
              className={`header-link ${activeTab === 'games' ? 'header-link-active' : ''}`}
              onClick={() => {
                setActiveTab('games')
                setStage('games')
                setSelectedGame(null)
              }}
            >
              Games
            </button>
            <button
              type="button"
              className={`header-link ${activeTab === 'caseStudy' ? 'header-link-active' : ''}`}
              onClick={() => {
                setActiveTab('caseStudy')
                goHome()
                const el = document.getElementById('how-it-works')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              Case study
            </button>
          </nav>
          <button
            type="button"
            className="header-cta"
            onClick={() => {
              // Trigger AI guide to open
              const event = new CustomEvent('openAIGuide')
              window.dispatchEvent(event)
            }}
          >
            🎤 Ask AI Guide
          </button>
        </div>
      </header>

      {loading && <p className="info">Loading data from backend…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {stage === 'home' && (
            <>
              <section className="section hero-section">
                <h2>
                  {activeTab === 'caseStudy'
                    ? 'Behind the Screens.'
                    : 'AI agents that decode competitors, mimic your players, and deliver insights 10x faster.'}
                </h2>
                <p className="hero-subtitle">
                  {activeTab === 'caseStudy'
                    ? 'Real-world examples of AI leveling up game development.'
                    : 'Competitive intelligence and game design acceleration for gaming studios. AI player agents automatically play competitor games, reverse-engineer their strategies, and reveal exactly how each game treats different player segments — delivering actionable insights to boost monetization, reduce churn, and cut PM costs by 60%.'}
                </p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setActiveTab('agents')
                      setStage('agents')
                    }}
                  >
                    AI agents
                  </button>
                  <button
                    type="button"
                    className="secondary-link"
                    onClick={() => {
                      setActiveTab('agents')
                      setStage('agents')
                    }}
                  >
                    Learn more
                  </button>
                </div>
              </section>

              {activeTab !== 'caseStudy' && (
                <section className="section bingo-cards-section">
                  <h2 className="bingo-cards-title">WHAT THE AI AGENTS ACTUALLY DO</h2>
                  <div className="bingo-cards-grid">
                    <div className="bingo-card bingo-card-1">
                      <div className="bingo-card-icon">👁️</div>
                      <h3 className="bingo-card-title">Real Player<br />Observation</h3>
                      <p className="bingo-card-text">They watch the game like a real player — seeing every screen, button, and animation.</p>
                    </div>
                    <div className="bingo-card bingo-card-2">
                      <div className="bingo-card-icon">🎮</div>
                      <h3 className="bingo-card-title">Authentic Segment<br />Behavior</h3>
                      <p className="bingo-card-text">They react authentically like players from different segments (whales, casuals, veterans).</p>
                    </div>
                    <div className="bingo-card bingo-card-3">
                      <div className="bingo-card-icon">📊</div>
                      <h3 className="bingo-card-title">Game Mechanic<br />Capture</h3>
                      <p className="bingo-card-text">They capture what the game tries to do to them at every moment — every offer, timer, nudge.</p>
                    </div>
                    <div className="bingo-card bingo-card-4">
                      <div className="bingo-card-icon">🗺️</div>
                      <h3 className="bingo-card-title">Journey<br />Mapping</h3>
                      <p className="bingo-card-text">They map the full player journey from onboarding through retention loops and monetization funnels.</p>
                    </div>
                    <div className="bingo-card bingo-card-5">
                      <div className="bingo-card-icon">⏰</div>
                      <h3 className="bingo-card-title">Pressure<br />Tracking</h3>
                      <p className="bingo-card-text">They track when and how games apply pressure — FOMO timers, event triggers, paywalls, limited offers.</p>
                    </div>
                    <div className="bingo-card bingo-card-6">
                      <div className="bingo-card-icon">🎯</div>
                      <h3 className="bingo-card-title">Competitor<br />Intelligence</h3>
                      <p className="bingo-card-text">They reveal how competitors treat different player segments with surgical precision.</p>
                    </div>
                    <div className="bingo-card bingo-card-7">
                      <div className="bingo-card-icon">📈</div>
                      <h3 className="bingo-card-title">Real-Time<br />Analytics</h3>
                      <p className="bingo-card-text">They generate real-time analytics on engagement patterns, drop-off points, and revenue opportunities.</p>
                    </div>
                    <div className="bingo-card bingo-card-8">
                      <div className="bingo-card-icon">💡</div>
                      <h3 className="bingo-card-title">Deep Insights<br />Generation</h3>
                      <p className="bingo-card-text">Each AI agent is a lens into exactly how the game would treat that specific customer type — giving you insights that would take weeks of manual QA and analytics.</p>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'caseStudy' && (
                <>
                  <section className="section case-study-video-section">
                    <div className="case-study-video-grid">
                      <div className="case-study-video-frame">
                        <iframe
                          className="case-study-video-iframe"
                          src="https://www.youtube.com/embed/CWcSRCnRuqw"
                          title="It’s summer time, it’s Bingo time, it’s jackpot time! It’s celebration time! Happy 6th Anniversary!"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                      <div className="case-study-video-text">
                        <h2>Watch the agents at work</h2>
                        <p>
                          Use AI agents to run full player journeys on real game builds and see how
                          monetization and retention mechanics behave, frame by frame.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="section stormforge-section">
                    <div className="stormforge-grid">
                      <div className="stormforge-text">
                        <h2>
                          Reducing analytics and product management costs by 60% while delivering
                          results 10× faster and more accurately.
                        </h2>
                        <p>
                          By using AI agents to map monetization, player journeys, and feature/event
                          engagement, studios reduced churn risks, lowered analytics & PM costs by
                          60%, and automated 400+ monthly tests—while enabling fast segment creation
                          and market-standard test design.
                        </p>
                      </div>
                      <div className="stormforge-media">
                        <video
                          src="/videos/asset_koyzJ1TVuEed1gZutFS77kEK.mp4"
                          loop
                          controls
                          playsInline
                        />
                      </div>
                    </div>
                  </section>

                  <section className="section results-section">
                    <h2>Results using AI agents</h2>
                    <ul className="results-list">
                      <li>
                        <span className="results-label">✔ competitor analysis</span>
                      </li>
                      <li>
                        <span className="results-label">✔ monetization decoding</span>
                      </li>
                      <li>
                        <span className="results-label">✔ player-segment mapping</span>
                      </li>
                      <li>
                        <span className="results-label">✔ automated gameplay exploration</span>
                      </li>
                      <li>
                        <span className="results-label">✔ PM/analytics cost reduction</span>
                      </li>
                      <li>
                        <span className="results-label">✔ fast insights</span>
                      </li>
                      <li>
                        <span className="results-label">✔ no-code integrations</span>
                      </li>
                    </ul>
                    <p className="results-footnote">
                      Studios use these AI agents to decode monetization, explore player journeys,
                      and make analytics & PM decisions faster on top of their existing game builds.
                    </p>
                  </section>
                </>
              )}

              <section className="section home-bottom-slide" />
            </>
          )}

          {stage === 'games' && (
            <section className="section games-section">
              <h2>Games Decoded So Far</h2>
              <p className="segments-subtitle">
                Six competitor games reverse-engineered through our AI agents' eyes.
              </p>
              <div className="game-cards">
                {COMPETITOR_GAMES.map((game) => (
                  <article 
                    key={game.id} 
                    className="game-card game-card-clickable"
                    onClick={() => {
                      setSelectedGame(game)
                      setStage('gameDashboard')
                    }}
                  >
                    {game.image && (
                      <img
                        src={game.image}
                        alt={game.title}
                        className="game-card-image-only"
                      />
                    )}
                    <div className="game-card-footer">
                      <div className="game-card-name">{game.title}</div>
                      {game.marketValue && (
                        <div className="game-card-value">{game.marketValue}</div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {stage === 'gameDashboard' && selectedGame && (
            <section className="section game-dashboard-section">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStage('games')
                  setSelectedGame(null)
                }}
              >
                ← Back to Games
              </button>
              
              <div className="game-dashboard-header">
                <div className="game-dashboard-title-section">
                  <h2 className="game-dashboard-title">{selectedGame.title} LIVE</h2>
                  <div className="game-dashboard-meta">
                    <span className="meta-item">Role: 👁️ Viewer</span>
                    <span className="meta-item">Organization: GameAnalytics</span>
                    <span className="meta-item">Platform: 📱 SDK: 📊</span>
                  </div>
                </div>
                <div className="dashboard-tabs">
                  <button className="dashboard-tab dashboard-tab-active">Overview</button>
                  <button className="dashboard-tab">Integration</button>
                </div>
              </div>

              <div className="game-metrics-row">
                <div className="game-metric-card">
                  <div className="game-metric-label">DAU ℹ️</div>
                  <div className="game-metric-value">{selectedGame.metrics?.dau || 'N/A'}</div>
                  <div className="game-metric-change">{selectedGame.metrics?.dauChange || '+0%'}</div>
                </div>
                <div className="game-metric-card">
                  <div className="game-metric-label">Playtime ℹ️</div>
                  <div className="game-metric-value">{selectedGame.metrics?.playtime || 'N/A'}</div>
                  <div className="game-metric-change">{selectedGame.metrics?.playtimeChange || '+0%'}</div>
                </div>
                <div className="game-metric-card">
                  <div className="game-metric-label">New Users ℹ️</div>
                  <div className="game-metric-value">{selectedGame.metrics?.newUsers || 'N/A'}</div>
                  <div className="game-metric-change">{selectedGame.metrics?.newUsersChange || '+0%'}</div>
                </div>
                <div className="game-metric-card">
                  <div className="game-metric-label">Sessions ℹ️</div>
                  <div className="game-metric-value">{selectedGame.metrics?.sessions || 'N/A'}</div>
                  <div className="game-metric-change">{selectedGame.metrics?.sessionsChange || '+0%'}</div>
                </div>
              </div>

              <div className="game-dashboard-main">
                <div className="game-active-users-chart">
                  <div className="chart-header">
                    <h3>Active users <span className="chart-badge">Live 🔴</span></h3>
                    <button className="chart-menu">⋮</button>
                  </div>
                  <div className="large-chart-container">
                    <svg className="large-line-chart" viewBox="0 0 800 300">
                      <polyline
                        points="0,250 50,240 100,220 150,180 200,150 250,120 300,100 350,90 400,85 450,80 500,85 550,100 600,130 650,160 700,200 750,230 800,250"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                      {[0,50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800].map((x, i) => (
                        <circle 
                          key={i} 
                          cx={x} 
                          cy={[250,240,220,180,150,120,100,90,85,80,85,100,130,160,200,230,250][i]} 
                          r="5" 
                          fill="#3b82f6"
                          className="chart-point"
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item"><span className="legend-dot blue"></span> time</span>
                  </div>
                </div>

                <div className="game-dashboard-sidebar">
                  <div className="integration-panel">
                    <h4>Integration</h4>
                    <div className="integration-status">
                      <div className="status-indicator collecting"></div>
                      Status: Collecting events...
                    </div>
                  </div>
                  
                  <div className="event-types-panel">
                    <h4>Event types</h4>
                    <p className="event-hint">Implement more event types in your game to gain greater insights</p>
                    <ul className="event-list">
                      <li className="event-item"><a href="#">Business events 🔗</a></li>
                      <li className="event-item"><a href="#">Resource events 🔗</a></li>
                      <li className="event-item"><a href="#">Progression events 🔗</a></li>
                      <li className="event-item"><a href="#">Error events 🔗</a></li>
                      <li className="event-item"><a href="#">Design events 🔗</a></li>
                      <li className="event-item"><a href="#">Ad events 🔗</a></li>
                      <li className="event-item"><a href="#">Impression events 🔗</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {stage === 'agents' && (
            <section className="section agents-section">
              <button
                type="button"
                className="back-button"
                onClick={() => setStage('home')}
              >
                ← Back to Home
              </button>
              <h2>Agent Segments</h2>
              <p className="segments-subtitle">
                Each AI agent represents a different player segment.
                <br />
                See how the game treats each one.
              </p>
              <div className="cards">
                {agents.map((agent) => (
                  <div key={agent.id} className="agent-panel-stack">
                    <article
                      className="card card-clickable"
                      onClick={() => {
                        setSelectedAgent(agent)
                        setStage('loading')
                      }}
                    >
                      <div className="card-header">
                        <h3 className="agent-name">{agent.name}</h3>
                        <p className="agent-segment-label">{getAgentSegmentLabel(agent)}</p>
                      </div>
                      <div className="agent-profile-art-wrapper">
                        <img
                          src={getAgentPanelImageUrl(agent)}
                          alt={agent.name}
                          className="agent-profile-art"
                        />
                      </div>
                      <div className="agent-stats">
                        <p className="agent-stat-line">
                          <span className="agent-stat-label">Lifetime value:</span>{' '}
                          ${agent.lifetime_value_usd.toFixed(2)}
                        </p>
                        <p className="agent-stat-line">
                          <span className="agent-stat-label">Days played:</span>{' '}
                          {agent.days_played.toLocaleString()}
                        </p>
                      </div>
                    </article>
                    <article
                      className="agent-info-card agent-info-card-clickable"
                      onClick={() => {
                        setSelectedAgent(agent)
                        setSelectedSegmentIndex(null)
                        setStage('finalInsights')
                      }}
                    >
                      <div className="agent-insight-tab">FINAL INSIGHT</div>
                      <p className="agent-insight-text">{getAgentFinalInsight(agent)}</p>
                    </article>
                  </div>
                ))}
              </div>
            </section>
          )}

          {stage === 'gateProgressionChart' && selectedAgent && (
            <section className="section">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStage('finalInsights')
                }}
              >
                <span>&larr;</span> Back to final insights
              </button>
              <div className="gate-chart-screen">
                <h2>Gate Progression – {selectedAgent.name}</h2>
                <p className="segments-subtitle">
                  Progression depth over recent checkpoints for{' '}
                  {getAgentSegmentLabel(selectedAgent)}
                </p>
                <div className="gate-chart-frame">
                  <MonetizeChart
                    series={getAgentProgressionSeries(selectedAgent)}
                  />
                </div>
                <div className="gate-video-frame">
                  <video
                    className="gate-video"
                    src="/videos/gate_demo.mp4"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                </div>
                {(() => {
                  const summary = getAgentGateSummary(selectedAgent)
                  if (!summary) return null
                  const keys = ['month', 'week', 'day']
                  return (
                    <div className="gate-metrics-row">
                      {keys.map((key) => {
                        const metric = summary[key]
                        if (!metric) return null
                        const trendClass =
                          metric.trend === 'up'
                            ? 'gate-metric-up'
                            : metric.trend === 'down'
                            ? 'gate-metric-down'
                            : 'gate-metric-flat'
                        return (
                          <div
                            key={key}
                            className={`gate-metric-card ${trendClass}`}
                          >
                            <div className="gate-metric-label">
                              {metric.label}
                            </div>
                            <div className="gate-metric-value">
                              {metric.value}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </section>
          )}

          {stage === 'finalInsights' && selectedAgent && (
            <section className="section">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStage('agents')
                  setSelectedAgent(null)
                  setSelectedSegmentIndex(null)
                  setInsightView('insights')
                }}
              >
                <span>&larr;</span> Back to agents
              </button>
              <div className="final-insight-screen">
                <h2>Final Insights – {selectedAgent.name}</h2>
                <p className="segments-subtitle">
                  Segment: {getAgentSegmentLabel(selectedAgent)} ({selectedAgent.segment})
                </p>
                
                <div className="insight-tabs">
                  <button
                    className={`insight-tab ${insightView === 'insights' ? 'insight-tab-active' : ''}`}
                    onClick={() => setInsightView('insights')}
                  >
                    Insights
                  </button>
                  <button
                    className={`insight-tab ${insightView === 'monetize' ? 'insight-tab-active' : ''}`}
                    onClick={() => setInsightView('monetize')}
                  >
                    Monetize
                  </button>
                </div>
                
                {insightView === 'insights' && (
                  <div className="final-insight-body">
                    <p className="agent-insight-text final-insight-summary">
                      {getAgentFinalInsight(selectedAgent)}
                    </p>
                    {getAgentFinalInsightDetails(selectedAgent).length > 0 && (
                    <div className="agent-insight-grid">
                      {getAgentFinalInsightDetails(selectedAgent).map((section) => (
                        <div
                          key={section.title}
                          className="agent-insight-section"
                        >
                          <h4 className="agent-insight-section-title">
                            {section.title}
                          </h4>
                          <p className="agent-insight-section-body">
                            {section.body}
                          </p>
                          {section.title === 'Gate progression' && (
                            <div className="gate-progression-chart">
                              <div className="chart-container">
                                <svg className="line-chart" viewBox="0 0 400 120">
                                  <polyline
                                    points="0,100 40,95 80,85 120,70 160,60 200,45 240,35 280,25 320,20 360,15 400,10"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                  />
                                  {[0,40,80,120,160,200,240,280,320,360,400].map((x, i) => (
                                    <circle 
                                      key={i} 
                                      cx={x} 
                                      cy={[100,95,85,70,60,45,35,25,20,15,10][i]} 
                                      r="4" 
                                      fill="#10b981"
                                      className="progress-point"
                                    />
                                  ))}
                                </svg>
                              </div>
                              <p className="gate-chart-label">Progressive depth over checkpoints</p>
                            </div>
                          )}
                          {section.title === 'Monetize' && (
                            <MonetizeChart
                              series={getAgentMonetizeSeries(selectedAgent)}
                            />
                          )}
                          {section.title === 'Retain' && (
                            <div className="retain-visualization">
                              <div className="retention-bars">
                                <div className="retention-bar-item">
                                  <div className="retention-bar-label">Day 1</div>
                                  <div className="retention-bar-track">
                                    <div className="retention-bar-fill" style={{width: '95%', background: '#10b981'}}></div>
                                  </div>
                                  <div className="retention-bar-value">95%</div>
                                </div>
                                <div className="retention-bar-item">
                                  <div className="retention-bar-label">Day 3</div>
                                  <div className="retention-bar-track">
                                    <div className="retention-bar-fill" style={{width: '78%', background: '#10b981'}}></div>
                                  </div>
                                  <div className="retention-bar-value">78%</div>
                                </div>
                                <div className="retention-bar-item">
                                  <div className="retention-bar-label">Day 7</div>
                                  <div className="retention-bar-track">
                                    <div className="retention-bar-fill" style={{width: '62%', background: '#3b82f6'}}></div>
                                  </div>
                                  <div className="retention-bar-value">62%</div>
                                </div>
                                <div class="retention-bar-item">
                                  <div className="retention-bar-label">Day 30</div>
                                  <div className="retention-bar-track">
                                    <div className="retention-bar-fill" style={{width: '45%', background: '#3b82f6'}}></div>
                                  </div>
                                  <div className="retention-bar-value">45%</div>
                                </div>
                              </div>
                              <p className="gate-chart-label">Streak retention over checkpoints</p>
                            </div>
                          )}
                          {section.title === 'Trigger events' && (
                            <div className="trigger-visualization">
                              <div className="trigger-frequency-chart">
                                <svg className="trigger-svg" viewBox="0 0 400 140">
                                  <rect x="20" y="100" width="60" height="40" fill="#8b5cf6" rx="4" className="trigger-bar" />
                                  <rect x="100" y="60" width="60" height="80" fill="#8b5cf6" rx="4" className="trigger-bar" />
                                  <rect x="180" y="40" width="60" height="100" fill="#a78bfa" rx="4" className="trigger-bar" />
                                  <rect x="260" y="70" width="60" height="70" fill="#8b5cf6" rx="4" className="trigger-bar" />
                                  <rect x="340" y="90" width="60" height="50" fill="#a78bfa" rx="4" className="trigger-bar" />
                                  <text x="50" y="130" fill="#9ca3af" fontSize="12" textAnchor="middle">Sess 1</text>
                                  <text x="130" y="130" fill="#9ca3af" fontSize="12" textAnchor="middle">Win</text>
                                  <text x="210" y="130" fill="#9ca3af" fontSize="12" textAnchor="middle">Break</text>
                                  <text x="290" y="130" fill="#9ca3af" fontSize="12" textAnchor="middle">Return</text>
                                  <text x="370" y="130" fill="#9ca3af" fontSize="12" textAnchor="middle">Sess 2</text>
                                </svg>
                              </div>
                              <p className="gate-chart-label">Event trigger frequency by session</p>
                            </div>
                          )}
                          {section.title === 'Personalize offers' && (
                            <div className="personalize-visualization">
                              <div className="offer-type-bars">
                                <div className="offer-type-item">
                                  <div className="offer-type-label">Exclusive bundles</div>
                                  <div className="offer-type-track">
                                    <div className="offer-type-fill" style={{width: '92%', background: 'linear-gradient(90deg, #eab308 0%, #f59e0b 100%)'}}></div>
                                  </div>
                                  <div className="offer-type-value">High</div>
                                </div>
                                <div className="offer-type-item">
                                  <div className="offer-type-label">Loyalty rewards</div>
                                  <div className="offer-type-track">
                                    <div className="offer-type-fill" style={{width: '85%', background: 'linear-gradient(90deg, #eab308 0%, #f59e0b 100%)'}}></div>
                                  </div>
                                  <div className="offer-type-value">High</div>
                                </div>
                                <div className="offer-type-item">
                                  <div className="offer-type-label">Status rewards</div>
                                  <div className="offer-type-track">
                                    <div className="offer-type-fill" style={{width: '70%', background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)'}}></div>
                                  </div>
                                  <div className="offer-type-value">Med</div>
                                </div>
                                <div className="offer-type-item">
                                  <div className="offer-type-label">Generic sales</div>
                                  <div className="offer-type-track">
                                    <div className="offer-type-fill" style={{width: '25%', background: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)'}}></div>
                                  </div>
                                  <div className="offer-type-value">Low</div>
                                </div>
                              </div>
                              <p className="gate-chart-label">Personalization strength by offer type</p>
                            </div>
                          )}
                          {section.title === 'React to different player archetypes' && (
                            <div className="archetypes-visualization">
                              <div className="archetypes-radar">
                                <svg className="archetypes-svg" viewBox="0 0 400 140">
                                  <circle cx="200" cy="70" r="60" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1" />
                                  <circle cx="200" cy="70" r="40" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,4" />
                                  <circle cx="200" cy="70" r="20" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,4" />
                                  <line x1="200" y1="70" x2="200" y2="10" stroke="#6b7280" strokeWidth="1" />
                                  <line x1="200" y1="70" x2="260" y2="70" stroke="#6b7280" strokeWidth="1" />
                                  <line x1="200" y1="70" x2="200" y2="130" stroke="#6b7280" strokeWidth="1" />
                                  <line x1="200" y1="70" x2="140" y2="70" stroke="#6b7280" strokeWidth="1" />
                                  <polygon points="200,25 240,70 200,115 160,70" fill="rgba(139, 92, 246, 0.3)" stroke="#8b5cf6" strokeWidth="2" />
                                  <circle cx="200" cy="25" r="5" fill="#8b5cf6" />
                                  <circle cx="240" cy="70" r="5" fill="#8b5cf6" />
                                  <circle cx="200" cy="115" r="5" fill="#8b5cf6" />
                                  <circle cx="160" cy="70" r="5" fill="#8b5cf6" />
                                  <text x="200" y="5" fill="#9ca3af" fontSize="11" textAnchor="middle">Achiever</text>
                                  <text x="268" y="74" fill="#9ca3af" fontSize="11">Challenge</text>
                                  <text x="200" y="145" fill="#9ca3af" fontSize="11" textAnchor="middle">Mastery</text>
                                  <text x="118" y="74" fill="#9ca3af" fontSize="11" textAnchor="end">Status</text>
                                </svg>
                              </div>
                              <p className="gate-chart-label">Emphasis on different reward motivations</p>
                            </div>
                          )}
                          {section.offers && section.offers.length > 0 && (
                            <ul className="insight-offer-list">
                              {(() => {
                                const maxPrice = Math.max(
                                  ...section.offers.map((o) => o.price),
                                )
                                return section.offers.map((offer) => {
                                  const width = `${(offer.price / maxPrice) * 100}%`
                                  return (
                                    <li
                                      key={offer.label}
                                      className="insight-offer-item"
                                    >
                                      <div className="insight-offer-header">
                                        <span className="insight-offer-label">
                                          {offer.label}
                                        </span>
                                        <span className="insight-offer-price">
                                          ${offer.price.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="insight-offer-bar-track">
                                        <div
                                          className="insight-offer-bar-fill"
                                          style={{ width }}
                                        />
                                      </div>
                                    </li>
                                  )
                                })
                              })()}
                            </ul>
                          )}
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                )}
                
                {insightView === 'monetize' && (
                  <div className="analytics-dashboard">
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-title">New Users</span>
                          <span className="metric-info">ℹ️</span>
                        </div>
                        <div className="metric-value">Unique users 2.3K</div>
                        <div className="chart-container">
                          <svg className="line-chart" viewBox="0 0 400 120">
                            <polyline
                              points="0,80 30,70 60,50 90,30 120,40 150,20 180,35 210,60 240,70 270,85 300,75 330,90 360,95 400,100"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                            />
                            {[0,30,60,90,120,150,180,210,240,270,300,330,360,400].map((x, i) => (
                              <circle key={i} cx={x} cy={[80,70,50,30,40,20,35,60,70,85,75,90,95,100][i]} r="3" fill="#3b82f6" />
                            ))}
                          </svg>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-title">Active Users</span>
                          <span className="metric-info">ℹ️</span>
                        </div>
                        <div className="metric-value">Unique users 5.6K</div>
                        <div className="chart-container">
                          <svg className="line-chart" viewBox="0 0 400 120">
                            <polyline
                              points="0,100 30,85 60,70 90,50 120,40 150,35 180,30 210,25 240,30 270,40 300,55 330,70 360,85 400,95"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                            />
                            {[0,30,60,90,120,150,180,210,240,270,300,330,360,400].map((x, i) => (
                              <circle key={i} cx={x} cy={[100,85,70,50,40,35,30,25,30,40,55,70,85,95][i]} r="3" fill="#3b82f6" />
                            ))}
                          </svg>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-title">Revenue</span>
                          <span className="metric-info">ℹ️</span>
                        </div>
                        <div className="metric-value">Sum of amount $2.224K</div>
                        <div className="chart-container">
                          <svg className="line-chart" viewBox="0 0 400 120">
                            <polyline
                              points="0,100 30,95 60,90 90,80 120,70 150,60 180,65 210,50 240,45 270,30 300,40 330,50 360,60 400,70"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                            />
                            {[0,30,60,90,120,150,180,210,240,270,300,330,360,400].map((x, i) => (
                              <circle key={i} cx={x} cy={[100,95,90,80,70,60,65,50,45,30,40,50,60,70][i]} r="3" fill="#3b82f6" />
                            ))}
                          </svg>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-title">Price Points for {selectedAgent.name}</span>
                          <span className="metric-info">ℹ️</span>
                        </div>
                        <div className="agent-price-points">
                          {scenarios
                            .find((s) => s.agentId === selectedAgent.id)
                            ?.offers.map((offer) => (
                              <div key={offer.name} className="price-point-item">
                                <span className="price-point-name">{offer.name}</span>
                                <span className="price-point-price">${offer.price}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {stage === 'segmentFull' && selectedAgent && selectedSegmentIndex && (
            <section className="section">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStage('segments')
                  setSelectedSegmentIndex(null)
                }}
              >
                <span>&larr;</span> Back to segmented sales
              </button>
              <div className="segment-full-screen">
                <h2>Segmented Sale {selectedSegmentIndex}</h2>
                <p className="segments-subtitle">
                  Full-screen view for {selectedAgent.name} ({selectedAgent.segment})
                </p>
                <div className="segment-full-frame">
                  <img
                    src={getSegmentImageUrl(selectedAgent, selectedSegmentIndex)}
                    alt={`Segmented sale ${selectedSegmentIndex}`}
                    className="segment-full-image"
                  />
                </div>
              </div>
            </section>
          )}

          {stage === 'segments' && selectedAgent && (
            <section className="section">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStage('agents')
                  setSelectedAgent(null)
                  setSelectedSegmentIndex(null)
                }}
              >
                <span>&larr;</span> Back to agents
              </button>
              <div className="segments-screen">
                <h2>Segmented Sales HUD</h2>
                <p className="segments-subtitle">
                  Viewing segmented sale flows for {selectedAgent.name} ({selectedAgent.segment})
                </p>
                <div className="segment-hud-grid">
                  <article
                    className="segment-hud-card"
                    onClick={() => {
                      setSelectedSegmentIndex(1)
                      setStage('segmentFull')
                    }}
                  >
                    <img
                      src={getSegmentImageUrl(selectedAgent, 1)}
                      alt="Segmented sale 1"
                      className="segment-image"
                    />
                    <h3>Segmented Sale 1</h3>
                    <p>
                      Use this panel to represent your first common sale flow after the lobby
                      (e.g. Whale vs Casual scenario).
                    </p>
                    <div className="purchase-history-panel">
                      <h4 className="purchase-history-title">💰 Purchase History</h4>
                      {getSegmentPurchaseData(selectedAgent, 1).map((purchase, idx) => (
                        <div key={idx} className={`purchase-item ${purchase.purchased ? 'purchased' : 'not-purchased'}`}>
                          <div className="purchase-header">
                            <span className="purchase-offer-name">{purchase.offer}</span>
                            <span className={`purchase-status ${purchase.purchased ? 'status-purchased' : 'status-skipped'}`}>
                              {purchase.purchased ? '✓ PURCHASED' : '✗ NOT PURCHASED'}
                            </span>
                          </div>
                          <div className="purchase-prices">
                            <div className="price-comparison">
                              <span className="old-price">₹{purchase.oldPrice}</span>
                              <span className="price-arrow">→</span>
                              <span className="new-price">₹{purchase.newPrice}</span>
                            </div>
                            <span className="price-discount">{purchase.discount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                  <article
                    className="segment-hud-card"
                    onClick={() => {
                      setSelectedSegmentIndex(2)
                      setStage('segmentFull')
                    }}
                  >
                    <img
                      src={getSegmentImageUrl(selectedAgent, 2)}
                      alt="Segmented sale 2"
                      className="segment-image"
                    />
                    <h3>Segmented Sale 2</h3>
                    <p>
                      Use this panel to represent your second common sale flow after the lobby
                      (e.g. Lifecycle / feature-focused scenario).
                    </p>
                    <div className="purchase-history-panel">
                      <h4 className="purchase-history-title">💰 Purchase History</h4>
                      {getSegmentPurchaseData(selectedAgent, 2).map((purchase, idx) => (
                        <div key={idx} className={`purchase-item ${purchase.purchased ? 'purchased' : 'not-purchased'}`}>
                          <div className="purchase-header">
                            <span className="purchase-offer-name">{purchase.offer}</span>
                            <span className={`purchase-status ${purchase.purchased ? 'status-purchased' : 'status-skipped'}`}>
                              {purchase.purchased ? '✓ PURCHASED' : '✗ NOT PURCHASED'}
                            </span>
                          </div>
                          <div className="purchase-prices">
                            <div className="price-comparison">
                              <span className="old-price">₹{purchase.oldPrice}</span>
                              <span className="price-arrow">→</span>
                              <span className="new-price">₹{purchase.newPrice}</span>
                            </div>
                            <span className="price-discount">{purchase.discount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            </section>
          )}

          {stage === 'loading' && selectedAgent && (
            <section className="section">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStage('agents')
                  setSelectedAgent(null)
                }}
              >
                ← Back to agents
              </button>
              <div className="loading-screen">
                <h2>Frenzy Game loading...</h2>
                <img
                  src="/images/common-screens loading and lobby/Frenzy Loading screen.png"
                  alt="Frenzy game loading screen"
                  className="loading-image"
                />
                <p className="loading-subtitle">
                  Starting game for {selectedAgent.name} ({selectedAgent.segment})
                </p>
              </div>
            </section>
          )}

          {stage === 'lobby' && selectedAgent && (
            <section className="section">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStage('agents')
                  setSelectedAgent(null)
                }}
              >
                ← Back to agents
              </button>
              <div className="loading-screen">
                <h2>Game Lobby</h2>
                <img
                  src="/images/common-screens loading and lobby/ Game lobby.png"
                  alt="Game lobby screen"
                  className="loading-image"
                />
                <p className="loading-subtitle">
                  {selectedAgent.name} is now in the lobby
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default App
