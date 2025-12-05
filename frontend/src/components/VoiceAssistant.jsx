import React, { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '../config'

const HOME_SLIDES = [
  {
    id: 'hero-section',
    summary:
      'Hero slide – high-level overview of Bingo AI Agents and how they help decode game behavior.',
  },
  {
    id: 'how-it-works',
    summary:
      'How it works – explains how AI agents watch, react, and report on monetization and journeys.',
  },
  {
    id: 'results-section',
    summary:
      'Results slide – highlights outcomes like better monetization, lower churn, and faster insights.',
  },
]

function VoiceAssistant({ stage, setStage, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [heardText, setHeardText] = useState('')
  const [replyText, setReplyText] = useState('')
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isSupported, setIsSupported] = useState(true)
  const [isCallingApi, setIsCallingApi] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const recognitionRef = useRef(null)

  // Listen for header button click to open AI guide
  useEffect(() => {
    const handleOpenAIGuide = () => {
      setIsOpen(true)
    }

    window.addEventListener('openAIGuide', handleOpenAIGuide)
    return () => window.removeEventListener('openAIGuide', handleOpenAIGuide)
  }, [])

  const speak = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.rate = 1.1 // Slightly faster for more natural, responsive feel
    utterance.pitch = 1.0
    utterance.volume = 1.0
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const goToSlideByIndex = (index) => {
    if (!HOME_SLIDES.length) return

    const safeIndex = Math.max(0, Math.min(HOME_SLIDES.length - 1, index))
    const target = HOME_SLIDES[safeIndex]

    setCurrentSlideIndex(safeIndex)

    if (setActiveTab) {
      setActiveTab('home')
    }
    if (setStage && stage !== 'home') {
      setStage('home')
    }

    if (typeof window !== 'undefined') {
      const el = document.getElementById(target.id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    if (target.summary) {
      setReplyText(target.summary)
      speak(target.summary)
    }
  }

  const askBackend = async (text) => {
    try {
      setIsCallingApi(true)
      
      // Build context from recent conversation (last 3 exchanges)
      let contextMessage = text
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-3)
        const contextParts = recentHistory.map(
          (exchange) => `User: ${exchange.question}\nAssistant: ${exchange.answer}`
        )
        contextMessage = `${contextParts.join('\n\n')}\n\nUser: ${text}`
      }

      const response = await fetch(API_ENDPOINTS.assistant, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: contextMessage }),
      })

      if (!response.ok) {
        throw new Error('Assistant API failed')
      }

      const data = await response.json()
      if (data && data.reply) {
        setReplyText(data.reply)
        speak(data.reply)
        
        // Save to conversation history
        setConversationHistory((prev) => [
          ...prev,
          { question: text, answer: data.reply }
        ])
      }
    } catch (err) {
      const fallback =
        'I could not reach our cloud assistant right now, but in short: AI agents are simulated players that analyse games so product and analytics teams can move faster.'
      setReplyText(fallback)
      speak(fallback)
    } finally {
      setIsCallingApi(false)
    }
  }

  const answerQuestion = (lowerText) => {
    // Platform Overview
    if (lowerText.includes('what does this platform') || lowerText.includes('what is this')) {
      const answer =
        'This platform uses AI player agents to play competitor games, decode their strategies, and show you how each game treats different player segments. It reveals monetization patterns, retention mechanics, event strategies, and FTUE design that would take months to discover manually.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // AI Agents Definition
    if (lowerText.includes('what are ai') && lowerText.includes('agent')) {
      const answer =
        'AI player agents are behavioral models trained on real cohort data that act like human players. They explore games and respond to offers and events naturally. Whales behave like whales, casuals like casuals, feature-lovers like feature players.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Agent Learning
    if (lowerText.includes('how do agents learn') || lowerText.includes('how are they trained')) {
      const answer =
        'Agents are trained from real user data: session habits, spending patterns, churn signals, event participation, time spent, risk appetite, loss tolerance, purchase frequency, and more. Each agent literally plays like a real person from that segment.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Custom Segments
    if (lowerText.includes('custom') && lowerText.includes('segment')) {
      const answer =
        'Yes, any behavioral cohort or LTV segment can be modeled. You can create agents for any player type you want to analyze.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Competitor Detection
    if (lowerText.includes('what can') && lowerText.includes('detect')) {
      const answer =
        'The AI detects FOMO triggers, monetization funnels, FTUE paths, retention hooks, event cycles, gating moments, win-rate manipulation, offer sequencing, resource scarcity timing, and more. Everything competitors do to drive engagement and revenue.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Multiple Games
    if (lowerText.includes('compare') && lowerText.includes('games')) {
      const answer =
        'Yes, it has already reverse-engineered six competitor games end-to-end and can compare their strategies side by side.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Integration
    if (lowerText.includes('sdk') || lowerText.includes('integration') || lowerText.includes('code')) {
      const answer =
        'No SDK or engineering work needed. Zero code changes. Just point AI agents at the game and they start playing and collecting insights.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Monetization Help
    if (lowerText.includes('monetization') || lowerText.includes('arpdau')) {
      const answer =
        'It reveals pricing strategies, offer sequencing, resource scarcity timing, and high-value tactics used by competitors. By transferring proven monetization loops, studios typically see ARPDAU gains of 20 to 30 percent.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // PM Replacement
    if (lowerText.includes('replace') && (lowerText.includes('pm') || lowerText.includes('analyst'))) {
      const answer =
        'No, it does not replace PMs or analysts. It gives them insights ten times faster while cutting their workload by 60 percent, so they can focus on strategy instead of manual testing.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // FTUE Analysis
    if (lowerText.includes('ftue') || lowerText.includes('onboarding')) {
      const answer =
        'Yes, agents identify friction points, early resource shortages, win-rate pacing, tutorial issues, and player drop-off moments in the first-time user experience.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Events
    if (lowerText.includes('event') && !lowerText.includes('prevent')) {
      const answer =
        'Yes, agents participate in and decode event engagement, rewards, pressure loops, personalization triggers, and event monetization funnels.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Output Data
    if (lowerText.includes('what data') || lowerText.includes('what do we get')) {
      const answer =
        'You get player-agent logs, session journeys, event triggers, offer sequences, reward pacing, churn indicators, and PM logic maps. Real-time dashboards, Excel exports, GIFs, storyboards, and session replays.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Speed
    if (lowerText.includes('how quickly') || lowerText.includes('how fast')) {
      const answer =
        'Results appear within hours, not weeks. The AI is ten times faster than humans with 20 to 30 times more data coverage.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Cost Savings
    if (lowerText.includes('cost') || lowerText.includes('save')) {
      const answer =
        'This platform saves 30 to 60 percent of analytics and PM research time, giving you insights ten times faster with far more coverage.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Value Proposition
    if (lowerText.includes('why') || lowerText.includes('useful')) {
      const answer =
        'Because product managers spend weeks manually playing and reverse-engineering competitors. Our AI does it in hours. You get faster insights, better events, optimized monetization, and massive cost reduction.'
      setReplyText(answer)
      speak(answer)
      return
    }

    // Core Summary
    if (lowerText.includes('main idea') || lowerText.includes('summary')) {
      const answer =
        'AI agents that decode competitors, mimic your players, and deliver actionable game insights ten times faster. It is a competitive intelligence and game design acceleration system purpose built for gaming studios.'
      setReplyText(answer)
      speak(answer)
      return
    }

    const fallback =
      'Ask me about AI agents, monetization, player journeys, competitors, or why we built this. You can also say “next slide” or “go home” and I will walk you through the story.'
    setReplyText(fallback)
    speak(fallback)
  }

  const handleCommand = (rawText) => {
    const lower = rawText.toLowerCase()

    if (lower.includes('stop') || lower.includes('pause') || lower.includes('quiet') || lower.includes('silence')) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setReplyText('Paused. Ask me anything else or say "guide me" to navigate the website!')
      return
    }

    if (lower.includes('clear') || lower.includes('reset') || lower.includes('new conversation')) {
      setConversationHistory([])
      setReplyText('Conversation cleared. What would you like to know?')
      speak('Conversation cleared. What would you like to know?')
      return
    }

    if (lower.includes('next')) {
      const nextIndex = Math.min(HOME_SLIDES.length - 1, currentSlideIndex + 1)
      goToSlideByIndex(nextIndex)
      return
    }

    if (lower.includes('previous') || lower.includes('back')) {
      const prevIndex = Math.max(0, currentSlideIndex - 1)
      goToSlideByIndex(prevIndex)
      return
    }

    if (lower.includes('home') || lower.includes('start')) {
      goToSlideByIndex(0)
      return
    }

    // Navigation guidance commands
    if (lower.includes('guide me') || lower.includes('show me around') || lower.includes('how do i navigate')) {
      const answer =
        'The website has four main tabs in the header: HOME shows the overview, AI AGENTS lets you explore 5 different player segments, GAMES shows 6 competitor games with live dashboards, and CASE STUDY has examples. Click any tab to explore, or ask me about specific features!'
      setReplyText(answer)
      speak(answer)
      return
    }

    if (lower.includes('go to') && (lower.includes('agent') || lower.includes('segments'))) {
      const answer =
        'Click the AI agents tab in the top header. You will see 5 agent cards representing different player types like Veteran Spender and New Whale. Click any agent to see their complete journey through the game!'
      setReplyText(answer)
      speak(answer)
      return
    }

    if (lower.includes('go to') && lower.includes('game')) {
      const answer =
        'Click the Games tab in the header to see 6 competitor games we have decoded. Click any game tile like Coin Master to see its live analytics dashboard with DAU, playtime, and active users chart!'
      setReplyText(answer)
      speak(answer)
      return
    }

    if (lower.includes('show') && (lower.includes('insight') || lower.includes('monetize'))) {
      const answer =
        'To see insights, first click AI agents tab, then select any agent card. After the loading and lobby screens, click View final insights. You will see two tabs: INSIGHTS shows gate progression and strategies, MONETIZE shows analytics charts and price points!'
      setReplyText(answer)
      speak(answer)
      return
    }

    if (lower.includes('how') && (lower.includes('work') || lower.includes('navigate') || lower.includes('use'))) {
      const answer =
        'Start on HOME to see what AI agents do. Click AI AGENTS to explore 5 player segments and their journeys. Click GAMES to see 6 competitor games and their live dashboards. Each agent has detailed insights with tabs for regular insights and monetization data!'
      setReplyText(answer)
      speak(answer)
      return
    }

    if (
      lower.includes('agent') ||
      lower.includes('monetization') ||
      lower.includes('journey') ||
      lower.includes('competitor') ||
      lower.includes('why') ||
      lower.includes('help us') ||
      lower.includes('main idea')
    ) {
      answerQuestion(lower)
      return
    }

    askBackend(rawText)
  }

  const startListening = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null

    if (!SpeechRecognition) {
      setIsSupported(false)
      setIsOpen(true)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true // Keep listening for complete sentences
    recognition.interimResults = true // Show interim results for feedback
    recognition.maxAlternatives = 1

    let finalTranscript = ''
    let silenceTimer = null

    recognition.onresult = (event) => {
      let interimTranscript = ''
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Show what we're hearing in real-time
      const displayText = (finalTranscript + interimTranscript).trim()
      if (displayText) {
        setHeardText(displayText)
      }

      // Wait for 1.5 seconds of silence after speech to process
      if (finalTranscript.trim()) {
        clearTimeout(silenceTimer)
        silenceTimer = setTimeout(() => {
          const completeQuestion = finalTranscript.trim()
          if (completeQuestion) {
            recognition.stop()
            setHeardText(completeQuestion)
            handleCommand(completeQuestion)
            finalTranscript = ''
          }
        }, 1500) // Wait 1.5 seconds after speaking stops
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      clearTimeout(silenceTimer)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      clearTimeout(silenceTimer)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setIsOpen(true)
  }

  const handleToggle = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    // Stop any ongoing speech before starting to listen
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    
    startListening()
  }

  // Show on all screens
  return (
    <>
      {isOpen && (
        <div className="voice-bot-panel">
          <div className="voice-bot-header">
            <div className="voice-bot-title">AI tour guide</div>
            <button
              className="voice-bot-close"
              onClick={() => {
                setIsOpen(false)
                if (isListening && recognitionRef.current) {
                  recognitionRef.current.stop()
                  setIsListening(false)
                }
              }}
            >
              ✕
            </button>
          </div>
          <p className="voice-bot-hint">
            Speak naturally—I'll wait for your complete question. Say "stop" or "pause" to stop speaking. Say "guide me" to navigate the website, or "clear" to reset.
          </p>
          <button
            type="button"
            className={`voice-bot-listen-btn ${isListening ? 'listening' : ''}`}
            onClick={handleToggle}
          >
            {isListening ? '🎤 Listening... click to stop' : '🎤 Start Listening'}
          </button>
          {isCallingApi && (
            <p className="voice-bot-line voice-bot-bot">Thinking about your question…</p>
          )}
          {heardText && (
            <p className="voice-bot-line voice-bot-user">You: {heardText}</p>
          )}
          {replyText && (
            <p className="voice-bot-line voice-bot-bot">Agent: {replyText}</p>
          )}
          {!isSupported && (
            <p className="voice-bot-warning">
              Voice controls are not available in this browser, but you can still read the
              quick tips above.
            </p>
          )}
        </div>
      )}
    </>
  )
}

export default VoiceAssistant
