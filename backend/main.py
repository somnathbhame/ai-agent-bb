from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Bingo AI Agents API")


# Allow the React dev server and deployed frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.(vercel\.app|netlify\.app)|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Offer(BaseModel):
    id: str
    description: str
    price_usd: float


class Agent(BaseModel):
    id: int
    name: str
    segment: str
    lifetime_value_usd: float
    days_played: int


class AgentScenario(BaseModel):
    scenario_id: str
    scenario_name: str
    agent: Agent
    game: str
    expected_sessions_per_day: float
    offers: List[Offer]


AGENTS: List[Agent] = [
    Agent(id=1, name="Agent 1", segment="VeteranSpender13Y", lifetime_value_usd=500.0, days_played=365 * 13),
    Agent(id=2, name="Agent 2", segment="NewRegular_7_30d", lifetime_value_usd=15.0, days_played=21),
    Agent(id=3, name="Agent 3", segment="Whale90D_100plus", lifetime_value_usd=150.0, days_played=90),
    Agent(id=4, name="Agent 4", segment="FeatureEngagedNonSpender", lifetime_value_usd=0.0, days_played=45),
    Agent(id=5, name="Agent 5", segment="RandomCasualVisitor", lifetime_value_usd=1.0, days_played=5),
]


SCENARIOS: List[AgentScenario] = [
    # Scenario 1: Whale vs Casual - Whale side
    AgentScenario(
        scenario_id="whale_vs_casual_whale",
        scenario_name="Whale vs Casual – Whale",
        agent=AGENTS[2],
        game="Frenzy",
        expected_sessions_per_day=4.0,
        offers=[
            Offer(id="diamond_small", description="500 Diamonds", price_usd=9.99),
            Offer(id="diamond_medium", description="1,200 Diamonds", price_usd=19.99),
            Offer(id="diamond_large", description="3,000 Diamonds", price_usd=49.99),
        ],
    ),
    # Scenario 1: Whale vs Casual - Casual side
    AgentScenario(
        scenario_id="whale_vs_casual_casual",
        scenario_name="Whale vs Casual – Casual Visitor",
        agent=AGENTS[4],
        game="Frenzy",
        expected_sessions_per_day=1.0,
        offers=[
            Offer(id="piggybank_cashout", description="Piggy Bank Cash-out (800 Coins)", price_usd=2.99),
            Offer(id="tournament_boost", description="Tournament Boost", price_usd=0.99),
        ],
    ),
    # Scenario 2: Lifecycle - Veteran spender
    AgentScenario(
        scenario_id="lifecycle_veteran",
        scenario_name="Lifecycle – Veteran Spender",
        agent=AGENTS[0],
        game="Voyage",
        expected_sessions_per_day=3.5,
        offers=[
            Offer(id="room_upsell_high", description="Extra cards + x3 bet", price_usd=3.99),
        ],
    ),
    # Scenario 2: Lifecycle - New regular
    AgentScenario(
        scenario_id="lifecycle_new_regular",
        scenario_name="Lifecycle – New Regular",
        agent=AGENTS[1],
        game="Voyage",
        expected_sessions_per_day=2.0,
        offers=[
            Offer(id="room_upsell_low", description="Extra cards + x2 bet", price_usd=1.99),
            Offer(id="club_subscription", description="Monthly Club Membership", price_usd=4.99),
        ],
    ),
    # Scenario 2: Lifecycle - Feature-engaged non-spender
    AgentScenario(
        scenario_id="lifecycle_feature_engaged",
        scenario_name="Lifecycle – Feature-Engaged Non-spender",
        agent=AGENTS[3],
        game="Voyage",
        expected_sessions_per_day=2.5,
        offers=[
            Offer(id="feature_tickets_small", description="10 Feature Tickets", price_usd=1.99),
            Offer(id="season_pass", description="Season Pass Premium Track", price_usd=9.99),
        ],
    ),
]


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


client = OpenAI()


@app.get("/api/agents", response_model=List[Agent])
def get_agents() -> List[Agent]:
    """Return the 5 base agent segments."""

    return AGENTS


@app.get("/api/scenarios", response_model=List[AgentScenario])
def get_scenarios() -> List[AgentScenario]:
    """Return the pre-defined simulation scenarios with price points."""

    return SCENARIOS


@app.post("/api/assistant", response_model=ChatResponse)
def chat_with_assistant(payload: ChatRequest) -> ChatResponse:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Assistant API key is not configured.")

    try:
        system_prompt = (
            "You are an intelligent, conversational AI guide for an AI-powered competitive intelligence and game design acceleration platform.\n\n"
            
            "PLATFORM OVERVIEW:\n"
            "The platform uses segmented AI player agents trained from real cohorts to play competitor games automatically, "
            "reverse-engineer their strategies, and show exactly how each game treats different player types. "
            "It delivers actionable insights to increase monetization, reduce churn, improve FTUE, design better features and events, "
            "optimize progression, build better LiveOps, cut PM costs by 60%, and get insights 10x faster.\n\n"
            
            "AI AGENTS:\n"
            "- Behavioral models trained on real user data: session habits, spending patterns, churn signals, event participation\n"
            "- Simulate whales, dolphins, casuals, veterans, feature-lovers, social players, FTUE-sensitive players\n"
            "- Each agent plays like a real person from that segment with authentic reactions\n"
            "- Custom segments can be created for any behavioral cohort or LTV tier\n\n"
            
            "WHAT AGENTS DETECT:\n"
            "FOMO triggers, monetization funnels, FTUE paths, retention hooks, event cycles, gating moments, "
            "win-rate manipulation, offer sequencing, resource scarcity timing, paywall locations, event monetization, "
            "payer segmentation rules, daily reward pacing, level bottlenecks, loss-aversion mechanics.\n\n"
            
            "KEY CAPABILITIES:\n"
            "- 400+ automated tests per month across multiple competitor games\n"
            "- Real-time competitor treatment logs and session replays\n"
            "- Multi-session journey mapping from FTUE through retention loops\n"
            "- No SDK or code integration needed - zero engineering work\n"
            "- Results in hours not weeks\n"
            "- Dashboards, Excel exports, GIFs, storyboards, session replays\n\n"
            
            "BUSINESS IMPACT:\n"
            "- 30-60% reduction in analytics and PM research time\n"
            "- 10x faster insights with 20-30x more coverage\n"
            "- 20-30% ARPDAU gains when applying competitor monetization strategies\n"
            "- Works for any mobile, bingo, puzzle, casino, or UI-heavy game\n\n"
            
            "WEBSITE STRUCTURE AND NAVIGATION:\n"
            "HOME PAGE: Hero section with platform overview, colorful bingo-style cards showing 'What AI Agents Actually Do' with 8 key points:\n"
            "1. Real Player Observation - watch like real player\n"
            "2. Authentic Segment Behavior - react like different segments (whales, casuals, veterans)\n"
            "3. Game Mechanic Capture - capture every offer, timer, nudge\n"
            "4. Journey Mapping - map full player journey from onboarding through monetization funnels\n"
            "5. Pressure Tracking - track FOMO timers, event triggers, paywalls, limited offers\n"
            "6. Competitor Intelligence - reveal how competitors treat different player segments\n"
            "7. Real-Time Analytics - generate analytics on engagement patterns, drop-off points, revenue opportunities\n"
            "8. Deep Insights Generation - insights that would take weeks of manual QA and analytics\n\n"
            
            "NAVIGATION TABS (in header):\n"
            "- HOME: Main landing page with overview and bingo cards\n"
            "- AI AGENTS: Shows 5 agent segments - click any agent to see their journey\n"
            "- GAMES: Shows 6 competitor games decoded - click any game to see live dashboard\n"
            "- CASE STUDY: Shows video examples and case studies\n\n"
            
            "AI AGENTS FLOW:\n"
            "1. Click 'AI agents' tab → See 5 agent cards (Veteran Spender, New Whale, New F2P, Dormant Returner, Feature Lover)\n"
            "2. Click any agent → Loading screen (2 sec) → Lobby screen → Agent's journey\n"
            "3. Agent journey shows: Segmented Sales HUD with different sale flows\n"
            "4. Click 'View final insights' → See two tabs: INSIGHTS and MONETIZE\n"
            "5. INSIGHTS tab: Shows gate progression (with green chart), monetization analysis, FTUE details, retention strategies\n"
            "6. MONETIZE tab: Shows interactive analytics dashboard with New Users, Active Users, Revenue charts, plus agent-specific price points\n\n"
            
            "GAMES DASHBOARD FLOW:\n"
            "1. Click 'Games' tab → See 6 competitor games (Coin Master, Bingo Blitz, etc.)\n"
            "2. Click any game tile → Opens live game dashboard\n"
            "3. Dashboard shows: DAU (5.38k), Playtime (12m 38s), New Users (3.34k), Sessions (9.77k)\n"
            "4. Large active users chart with 17 interactive data points (hover to see details)\n"
            "5. Sidebar: Integration status (collecting events) and Event types panel\n"
            "6. Click 'Back to Games' to return\n\n"
            
            "AI VOICE GUIDE FEATURES:\n"
            "- Voice guide button in top-right header: '🎤 Ask AI Guide'\n"
            "- Click to open panel, click 'Start Listening' to activate voice\n"
            "- Can answer questions about platform, guide through screens, explain features\n"
            "- Commands: 'stop' or 'pause' to stop speaking, 'clear' or 'reset' to start fresh conversation\n"
            "- Navigation commands: 'go to agents', 'show me games', 'take me home', 'go to insights'\n"
            "- Remembers conversation context for natural follow-ups\n\n"
            
            "WHEN GUIDING USERS:\n"
            "- If user asks to see agents: Tell them to 'Click the AI agents tab in the header, then select any agent card to see their journey'\n"
            "- If user asks about monetization: Explain they can see monetization insights in agent details under the MONETIZE tab\n"
            "- If user asks about games: Direct them to 'Click the Games tab to see 6 competitor games, then click any game to see its live analytics dashboard'\n"
            "- If user asks how to navigate: Explain the header tabs (Home, AI agents, Games, Case study) and the flow through each section\n"
            "- Always be specific about which button to click and what they'll see next\n\n"
            
            "COMMUNICATION STYLE:\n"
            "Be conversational and natural. Adapt tone based on question depth. Keep answers concise (2-4 sentences) but valuable. "
            "Connect to real-world impact. Build on context naturally for follow-ups. Think fast, respond naturally, be helpful. "
            "When guiding navigation, be clear and specific about click paths and what users will see."
        )

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": payload.message},
            ],
            max_tokens=280,
            temperature=0.8,
        )
        reply_text = completion.choices[0].message.content.strip()
        return ChatResponse(reply=reply_text)
    except Exception:
        raise HTTPException(status_code=500, detail="Assistant failed to answer the question.")


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
