import numpy as np
import pandas as pd
import random
from datetime import datetime, timedelta

# Reproducibility
np.random.seed(42)
random.seed(42)

SEGMENTS = [
    "VeteranSpender13Y",
    "NewRegular_7_30d",
    "Whale90D_100plus",
    "FeatureEngagedNonSpender",
    "RandomCasualVisitor",
]

# -----------------------------
# 1. CREATE AGENT PROFILES
# -----------------------------
def generate_players_per_segment(n_per_segment: int = 100) -> pd.DataFrame:
    """
    Create base player/agent profiles for all 5 segments (game-agnostic).
    These are the 'AI agents' you will train/use.
    """
    rows = []

    for seg in SEGMENTS:
        for i in range(1, n_per_segment + 1):
            pid = f"{seg[:3].upper()}_{i:04d}"
            if seg == "VeteranSpender13Y":
                account_age_days = int(np.clip(np.random.normal(13 * 365, 120), 10 * 365, 16 * 365))
                sessions_per_week = np.random.randint(10, 28)
                avg_session_min = max(15, np.random.normal(35, 8))
                level = np.random.randint(300, 1000)
                is_payer = 1
                avg_monthly_spend = np.random.gamma(4, 25)  # 50–300+
                lifetime_spend = avg_monthly_spend * (account_age_days / 30.0) * np.random.uniform(0.7, 1.3)
                vip_tier = random.choice(["Gold", "Platinum", "Diamond"])
                core_eng = float(np.clip(np.random.normal(9.2, 0.6), 7, 10))
                feat_eng = float(np.clip(np.random.normal(8.8, 0.8), 6, 10))

            elif seg == "NewRegular_7_30d":
                account_age_days = np.random.randint(7, 31)
                sessions_per_week = np.random.randint(5, 14)
                avg_session_min = max(8, np.random.normal(18, 5))
                level = np.random.randint(5, 80)
                is_payer = int(random.random() < 0.25)
                avg_monthly_spend = np.random.uniform(1, 15) if is_payer else 0.0
                lifetime_spend = avg_monthly_spend * (account_age_days / 30.0)
                vip_tier = "None"
                core_eng = float(np.clip(np.random.normal(7.8, 1.0), 4, 10))
                feat_eng = float(np.clip(np.random.normal(6.5, 1.2), 3, 10))

            elif seg == "Whale90D_100plus":
                account_age_days = np.random.randint(70, 120)
                sessions_per_week = np.random.randint(7, 20)
                avg_session_min = max(15, np.random.normal(28, 7))
                level = np.random.randint(60, 250)
                is_payer = 1
                avg_monthly_spend = np.random.uniform(100, 400)
                lifetime_spend = avg_monthly_spend * (account_age_days / 30.0) * np.random.uniform(0.8, 1.2)
                vip_tier = random.choice(["HighRoller", "VIP"])
                core_eng = float(np.clip(np.random.normal(8.6, 0.9), 6, 10))
                feat_eng = float(np.clip(np.random.normal(8.0, 1.0), 5, 10))

            elif seg == "FeatureEngagedNonSpender":
                account_age_days = np.random.randint(60, 365 * 3)
                sessions_per_week = np.random.randint(6, 18)
                avg_session_min = max(10, np.random.normal(25, 6))
                level = np.random.randint(120, 500)
                is_payer = 0
                avg_monthly_spend = 0.0
                lifetime_spend = 0.0
                vip_tier = "None"
                core_eng = float(np.clip(np.random.normal(8.5, 0.9), 6, 10))
                feat_eng = float(np.clip(np.random.normal(9.2, 0.6), 7, 10))

            else:  # RandomCasualVisitor
                account_age_days = np.random.randint(1, 365 * 5)
                sessions_per_week = int(np.random.choice([0, 1, 2, 3, 4], p=[0.25, 0.35, 0.2, 0.15, 0.05]))
                avg_session_min = max(3, np.random.normal(10, 5))
                level = np.random.randint(1, 120)
                is_payer = int(random.random() < 0.15)
                avg_monthly_spend = np.random.uniform(1, 20) if is_payer else 0.0
                lifetime_spend = avg_monthly_spend * (account_age_days / 30.0)
                vip_tier = "None"
                core_eng = float(np.clip(np.random.normal(3.5, 1.5), 1, 7))
                feat_eng = float(np.clip(np.random.normal(2.8, 1.4), 1, 7))

            churn_risk = float(np.clip(1.0 - (core_eng + feat_eng) / 20.0 + np.random.normal(0, 0.08), 0, 1))

            rows.append({
                "Segment": seg,
                "PlayerID": pid,
                "AccountAgeDays": int(account_age_days),
                "SessionsPerWeek": int(sessions_per_week),
                "AvgSessionLengthMin": round(float(avg_session_min), 1),
                "Level": int(level),
                "IsPayer": int(is_payer),
                "AvgMonthlySpendUSD": round(float(avg_monthly_spend), 2),
                "LifetimeSpendUSD": round(float(lifetime_spend), 2),
                "VipTier": vip_tier,
                "CoreGameEngagement_1_10": round(core_eng, 1),
                "FeatureEngagement_1_10": round(feat_eng, 1),
                "ChurnRisk_0_1": round(churn_risk, 3),
            })

    return pd.DataFrame(rows)


def attach_behavior_profiles(players: pd.DataFrame) -> pd.DataFrame:
    """
    Attach behavior parameters (how these agents react to popups, offers, FOMO, etc.)
    This represents the agent policy priors before any ML training.
    """
    behavior_rows = []
    for _, row in players.iterrows():
        seg = row["Segment"]
        if seg == "VeteranSpender13Y":
            popup_click = np.clip(np.random.normal(0.75, 0.08), 0.4, 0.95)
            sale_conv = np.clip(np.random.normal(0.6, 0.1), 0.3, 0.9)
            pref_offer = random.choice(["HighValueBundle", "VIPSeasonPass", "LimitedTimeJackpotChest"])
            disc_sens = np.clip(np.random.normal(0.4, 0.15), 0, 1)
            fomo_react = np.clip(np.random.normal(0.8, 0.1), 0.4, 1)
            social_react = np.clip(np.random.normal(0.7, 0.15), 0.3, 1)
            ad_tol = np.clip(np.random.normal(0.6, 0.1), 0.3, 0.9)

        elif seg == "NewRegular_7_30d":
            popup_click = np.clip(np.random.normal(0.6, 0.12), 0.2, 0.9)
            sale_conv = np.clip(np.random.normal(0.25, 0.08), 0.05, 0.6)
            pref_offer = random.choice(["WelcomePack", "StarterBundle", "FirstPurchaseBonus", "DailyLoginDeal"])
            disc_sens = np.clip(np.random.normal(0.7, 0.15), 0.2, 1)
            fomo_react = np.clip(np.random.normal(0.6, 0.15), 0.1, 1)
            social_react = np.clip(np.random.normal(0.5, 0.2), 0, 1)
            ad_tol = np.clip(np.random.normal(0.5, 0.15), 0.1, 0.9)

        elif seg == "Whale90D_100plus":
            popup_click = np.clip(np.random.normal(0.7, 0.1), 0.4, 0.95)
            sale_conv = np.clip(np.random.normal(0.55, 0.12), 0.25, 0.9)
            pref_offer = random.choice(["LivesPack", "SealsPack", "HighRollerBundle", "EventPowerBundle"])
            disc_sens = np.clip(np.random.normal(0.5, 0.15), 0.1, 1)
            fomo_react = np.clip(np.random.normal(0.85, 0.1), 0.5, 1)
            social_react = np.clip(np.random.normal(0.65, 0.15), 0.2, 1)
            ad_tol = np.clip(np.random.normal(0.7, 0.1), 0.3, 1)

        elif seg == "FeatureEngagedNonSpender":
            popup_click = np.clip(np.random.normal(0.55, 0.1), 0.2, 0.9)
            sale_conv = 0.0
            pref_offer = "NonMonetizedRewards"
            disc_sens = np.clip(np.random.normal(0.3, 0.15), 0, 1)
            fomo_react = np.clip(np.random.normal(0.6, 0.15), 0.2, 1)
            social_react = np.clip(np.random.normal(0.75, 0.15), 0.3, 1)
            ad_tol = np.clip(np.random.normal(0.8, 0.1), 0.4, 1)

        else:  # RandomCasualVisitor
            popup_click = np.clip(np.random.normal(0.3, 0.12), 0.0, 0.7)
            sale_conv = np.clip(np.random.normal(0.1, 0.05), 0.0, 0.4) if row["IsPayer"] == 1 else 0.0
            pref_offer = random.choice(["None", "LowFrictionTrial", "AdRemovalSmall", "SmallCoinPack"])
            disc_sens = np.clip(np.random.normal(0.6, 0.2), 0, 1)
            fomo_react = np.clip(np.random.normal(0.35, 0.15), 0, 0.8)
            social_react = np.clip(np.random.normal(0.25, 0.15), 0, 0.8)
            ad_tol = np.clip(np.random.normal(0.4, 0.2), 0, 1)

        behavior_rows.append({
            "PopupClickRate_0_1": round(float(popup_click), 3),
            "SaleConversionRate_0_1": round(float(sale_conv), 3),
            "PreferredOfferType": pref_offer,
            "DiscountSensitivity_0_1": round(float(disc_sens), 3),
            "FOMO_TimerReaction_0_1": round(float(fomo_react), 3),
            "SocialFeatureReaction_0_1": round(float(social_react), 3),
            "AdTolerance_0_1": round(float(ad_tol), 3),
        })

    behavior_df = pd.DataFrame(behavior_rows, index=players.index)
    merged = pd.concat([players.reset_index(drop=True), behavior_df.reset_index(drop=True)], axis=1)
    return merged


# ------------------------------------------
# 2. ENVIRONMENT: BINGO VOYAGE & FRENZY
# ------------------------------------------

def env_treatment_policy(game: str, seg: str, level: int, is_payer: int):
    """
    Simplified 'product manager' logic:
    determines how the game treats the agent this session.
    Returns:
    - event_triggered (bool)
    - gate_type (str)
    - sale_price_tier (str)
    """
    game_lower = game.lower()
    gate_type = "None"
    event_triggered = False
    sale_price_tier = "None"

    if game_lower == "voyage":
        # Voyage: emotional, volatile, heavy FOMO + story-driven events
        if level % 5 == 0:
            event_triggered = True  # story / photo event
        # progression gating
        if level < 50:
            gate_type = "Soft"  # more forgiving early
        elif level < 200:
            gate_type = "TicketTight"
        else:
            gate_type = "HighCostRooms"

        # sale tiers by segment
        if seg == "VeteranSpender13Y":
            sale_price_tier = random.choice(["9.99", "19.99", "49.99"])
        elif seg == "Whale90D_100plus":
            sale_price_tier = random.choice(["4.99", "9.99", "24.99", "49.99"])
        elif seg == "NewRegular_7_30d":
            sale_price_tier = random.choice(["1.99", "3.99", "4.99"])
        elif seg == "FeatureEngagedNonSpender":
            sale_price_tier = "0.00"  # non-monetized rewards
        else:  # RandomCasualVisitor
            sale_price_tier = random.choice(["0.99", "1.99", "None"])

    else:  # Frenzy
        # Frenzy: stable, progression-driven, many rooms
        if level % 5 == 0:
            event_triggered = True  # special room, leaderboard etc.

        if level < 30:
            gate_type = "Soft"
        elif level < 100:
            gate_type = "RoomUnlockBased"
        else:
            gate_type = "SparseTickets"

        if seg in ["VeteranSpender13Y", "Whale90D_100plus"]:
            sale_price_tier = random.choice(["2.99", "5.99", "14.99", "29.99"])
        elif seg == "NewRegular_7_30d":
            sale_price_tier = random.choice(["1.99", "3.99", "Starter"])
        elif seg == "FeatureEngagedNonSpender":
            sale_price_tier = "FreeRoom/Bonus"
        else:
            sale_price_tier = random.choice(["0.99", "AdBased", "None"])

    if is_payer == 0 and sale_price_tier not in ["0.00", "FreeRoom/Bonus", "AdBased", "None"]:
        # non-payers often get cheaper "intro" prices in real PM logic
        sale_price_tier = "Intro_" + sale_price_tier

    return event_triggered, gate_type, sale_price_tier


def simulate_interactions(players: pd.DataFrame, game_name: str, days: int = 30) -> pd.DataFrame:
    """
    Simulate interactions of all agents with the specified game environment.
    This logs BOTH:
      - agent behavior (what they choose, whether they buy, etc.)
      - game treatment (offers, gating, events).
    """
    logs = []
    start_date = datetime.now().date() - timedelta(days=days)

    game_lower = game_name.lower()
    if game_lower == "voyage":
        base_win_rate = 0.32
        volatility_factor = 1.4
    elif game_lower == "frenzy":
        base_win_rate = 0.46
        volatility_factor = 0.8
    else:
        raise ValueError("game_name must be 'Voyage' or 'Frenzy'")

    for _, row in players.iterrows():
        pid = row["PlayerID"]
        seg = row["Segment"]
        sessions_per_week = max(0.1, float(row["SessionsPerWeek"]))
        avg_session_len = max(1.0, float(row["AvgSessionLengthMin"]))
        is_payer = int(row["IsPayer"])
        avg_monthly_spend = float(row["AvgMonthlySpendUSD"])
        popup_click = float(row["PopupClickRate_0_1"])
        sale_conv = float(row["SaleConversionRate_0_1"])
        fomo_react = float(row["FOMO_TimerReaction_0_1"])

        daily_lambda = sessions_per_week / 7.0

        for d in range(days):
            date = start_date + timedelta(days=d)
            sessions_today = np.random.poisson(daily_lambda)
            if sessions_today <= 0:
                continue

            for s in range(1, sessions_today + 1):
                # Agent decides core play parameters (policy-like)
                if seg == "VeteranSpender13Y":
                    num_cards = np.random.choice([4, 6], p=[0.3, 0.7])
                    bet_multiplier = np.random.choice([2, 3, 5], p=[0.2, 0.5, 0.3])
                    use_powerups = 1
                elif seg == "NewRegular_7_30d":
                    num_cards = np.random.choice([2, 3, 4], p=[0.4, 0.4, 0.2])
                    bet_multiplier = np.random.choice([1, 2, 3], p=[0.5, 0.3, 0.2])
                    use_powerups = int(random.random() < 0.4)
                elif seg == "Whale90D_100plus":
                    num_cards = np.random.choice([4, 6], p=[0.4, 0.6])
                    bet_multiplier = np.random.choice([3, 5, 8], p=[0.3, 0.5, 0.2])
                    use_powerups = 1
                elif seg == "FeatureEngagedNonSpender":
                    num_cards = np.random.choice([3, 4, 6], p=[0.3, 0.4, 0.3])
                    bet_multiplier = np.random.choice([1, 2, 3], p=[0.5, 0.3, 0.2])
                    use_powerups = int(random.random() < 0.7)
                else:  # RandomCasualVisitor
                    num_cards = np.random.choice([1, 2, 3], p=[0.5, 0.3, 0.2])
                    bet_multiplier = np.random.choice([1, 2], p=[0.7, 0.3])
                    use_powerups = int(random.random() < 0.2)

                # session length
                if game_lower == "voyage":
                    session_len = max(3.0, np.random.normal(avg_session_len * 1.05, 4))
                else:
                    session_len = max(3.0, np.random.normal(avg_session_len * 0.95, 3.5))

                rounds = max(1, int(session_len / 2.5))

                # base win rate influenced by engagement & risk
                engagement_factor = (row["CoreGameEngagement_1_10"] + row["FeatureEngagement_1_10"]) / 20.0
                card_factor = 1.0 + (num_cards - 2) * 0.06
                bet_factor = 1.0 + (bet_multiplier - 1) * 0.04
                win_rate = base_win_rate * engagement_factor * card_factor * bet_factor
                win_rate = float(np.clip(win_rate * np.random.normal(1.0, 0.15 * volatility_factor), 0.05, 0.9))

                wins = sum(1 for _ in range(rounds) if random.random() < win_rate)

                # --- GAME TREATMENT LOGIC (PM LOGIC) ---
                event_triggered, gate_type, sale_price_tier = env_treatment_policy(
                    game=game_name,
                    seg=seg,
                    level=int(row["Level"]),
                    is_payer=is_payer,
                )

                # pop-up probability (game chooses whether to show)
                popup_prob_env = 0.6 if game_lower == "voyage" else 0.5
                popup_shown = int(random.random() < popup_prob_env)

                # agent reaction to popup
                agent_clicked_popup = 0
                purchase_amount = 0.0
                offer_type_shown = None

                if popup_shown:
                    # Agent decides whether to click
                    if random.random() < popup_click:
                        agent_clicked_popup = 1
                        # Game chooses offer type (based on PM strategy)
                        if sale_price_tier in ["0.00", "FreeRoom/Bonus"]:
                            offer_type_shown = "FreeReward"
                        elif "Intro_" in sale_price_tier:
                            offer_type_shown = "IntroOffer"
                        elif sale_price_tier in ["AdBased"]:
                            offer_type_shown = "AdRewardPack"
                        else:
                            offer_type_shown = row["PreferredOfferType"]

                        # If agent is a payer, determine conversion
                        if is_payer and avg_monthly_spend > 0 and sale_conv > 0:
                            fomo_effect = 0.7 + 0.6 * fomo_react
                            eff_conv = sale_conv * fomo_effect
                            if random.random() < eff_conv:
                                base_daily = avg_monthly_spend / 30.0
                                purchase_amount = max(0.5, np.random.normal(base_daily * 1.2, base_daily * 0.5))
                    else:
                        # Did not click; still log that a popup was shown
                        offer_type_shown = "Ignored"

                logs.append({
                    "Game": game_name.capitalize(),
                    "Date": date.isoformat(),
                    "PlayerID": pid,
                    "Segment": seg,
                    # Agent behavior (decision)
                    "Agent_NumCards": int(num_cards),
                    "Agent_BetMultiplier": int(bet_multiplier),
                    "Agent_UsedPowerups": int(use_powerups),
                    "Agent_SessionLengthMin": round(session_len, 1),
                    "Agent_RoundsPlayed": int(rounds),
                    "Agent_RoundsWon": int(wins),
                    "Agent_ClickedPopup": int(agent_clicked_popup),
                    "Agent_PurchaseAmountUSD": round(float(purchase_amount), 2),
                    # Game treatment (how game treats the agent)
                    "Game_PopupShown": int(popup_shown),
                    "Game_OfferTypeShown": offer_type_shown,
                    "Game_GateType": gate_type,
                    "Game_EventTriggered": int(event_triggered),
                    "Game_SalePriceTier": sale_price_tier,
                })

    return pd.DataFrame(logs)


# ------------------------------------------
# 3. BUILD + SAVE DEMO EXCEL
# ------------------------------------------

def build_and_save_agent_env_demo(
    n_per_segment: int = 100,
    days: int = 30,
    output_file: str = "bingo_ai_agents_env_interactions.xlsx",
) -> None:
    """
    Generates:
      - Agent profiles (5 segments)
      - Interaction logs for Bingo Voyage
      - Interaction logs for Bingo Frenzy
    and saves them into a single Excel file with multiple sheets.
    """
    players = generate_players_per_segment(n_per_segment=n_per_segment)
    players = attach_behavior_profiles(players)

    logs_voyage = simulate_interactions(players, game_name="Voyage", days=days)
    logs_frenzy = simulate_interactions(players, game_name="Frenzy", days=days)

    with pd.ExcelWriter(output_file, engine="xlsxwriter") as writer:
        players.to_excel(writer, sheet_name="AgentProfiles", index=False)
        logs_voyage.to_excel(writer, sheet_name="Interactions_Voyage", index=False)
        logs_frenzy.to_excel(writer, sheet_name="Interactions_Frenzy", index=False)

    print(f"Excel file created: {output_file}")


# ==========================================
# 4. SIMPLE FRONTEND (STREAMLIT DEMO APP)
# ==========================================

def load_data_from_excel(path: str = "bingo_ai_agents_env_interactions.xlsx"):
    xls = pd.ExcelFile(path)
    profiles = pd.read_excel(xls, "AgentProfiles")
    v_logs = pd.read_excel(xls, "Interactions_Voyage")
    f_logs = pd.read_excel(xls, "Interactions_Frenzy")
    return profiles, v_logs, f_logs


def run_streamlit_app():
    import streamlit as st

    st.title("Bingo AI Agents – Competitor Simulation Demo")

    st.write(
        "This app shows how our 5 AI agent segments interact with Bingo Voyage & Frenzy.\n"
        "Use the controls on the left to select a segment, an example agent, and a game."
    )

    # Ensure data exists
    try:
        profiles, logs_voyage, logs_frenzy = load_data_from_excel()
    except FileNotFoundError:
        st.error("Excel file not found. Run the simulation first to generate 'bingo_ai_agents_env_interactions.xlsx'.")
        return

    segment = st.sidebar.selectbox("Choose Agent Segment", profiles["Segment"].unique())
    seg_profiles = profiles[profiles["Segment"] == segment]

    player_id = st.sidebar.selectbox("Choose Agent (PlayerID)", seg_profiles["PlayerID"])
    game = st.sidebar.radio("Game", ["Voyage", "Frenzy"])

    if game == "Voyage":
        logs = logs_voyage
    else:
        logs = logs_frenzy

    agent_profile = seg_profiles[seg_profiles["PlayerID"] == player_id]
    agent_logs = logs[logs["PlayerID"] == player_id].sort_values(["Date", "SessionIndex"])

    st.subheader("Agent Profile")
    st.dataframe(agent_profile)

    st.subheader("Agent Session Timeline")
    if agent_logs.empty:
        st.info("No sessions simulated for this agent yet.")
    else:
        st.dataframe(
            agent_logs[
                [
                    "Date",
                    "SessionIndex",
                    "Game",
                    "Agent_SessionLengthMin",
                    "Agent_NumCards",
                    "Agent_BetMultiplier",
                    "Agent_RoundsPlayed",
                    "Agent_RoundsWon",
                    "Game_PopupShown",
                    "Game_OfferTypeShown",
                    "Game_GateType",
                    "Game_EventTriggered",
                    "Agent_ClickedPopup",
                    "Agent_PurchaseAmountUSD",
                ]
            ]
        )

        st.subheader("Quick Summary")
        st.write(f"Total sessions: {len(agent_logs)}")
        st.write(f"Total purchase: ${agent_logs['Agent_PurchaseAmountUSD'].sum():.2f}")
        st.write(f"Popup click rate: {agent_logs['Agent_ClickedPopup'].mean():.2%}")
        st.write(f"Event trigger rate: {agent_logs['Game_EventTriggered'].mean():.2%}")


if __name__ == "__main__":
    # First: generate data once (you can comment this out later if not needed every run)
    build_and_save_agent_env_demo(
        n_per_segment=100,   # 5 * 100 = 500 agents total
        days=30,
        output_file="bingo_ai_agents_env_interactions.xlsx",
    )
    # Note: the Streamlit app is launched with `streamlit run this_file.py`
    # The `run_streamlit_app()` function will be invoked by Streamlit, not here.
