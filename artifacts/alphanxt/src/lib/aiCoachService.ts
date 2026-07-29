import type { TradeAnalysisInput, TradeAnalysis, CoachInsight, HoldingStyle } from '@/lib/aiCoachTypes';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function classifyHoldingStyle(durationMs: number): HoldingStyle {
  if (durationMs < HOUR) return 'Scalp';
  if (durationMs < DAY) return 'Intraday';
  if (durationMs < 14 * DAY) return 'Swing';
  return 'Position';
}

function formatDuration(durationMs: number): string {
  if (durationMs < MINUTE) return 'under a minute';
  if (durationMs < HOUR) return `${Math.round(durationMs / MINUTE)} min`;
  if (durationMs < DAY) return `${Math.round(durationMs / HOUR)} hr`;
  const days = Math.round(durationMs / DAY);
  return `${days} day${days === 1 ? '' : 's'}`;
}

/**
 * Rule-based post-trade analysis — no external AI call. Deterministic,
 * free, and instant. Never claims guaranteed future profits.
 */
export function analyzeTrade(input: TradeAnalysisInput): TradeAnalysis {
  const {
    entryPrice,
    exitPrice,
    quantity,
    plannedStopLoss,
    plannedTakeProfit,
    holdingDurationMs,
  } = input;

  const realizedPL = (exitPrice - entryPrice) * quantity;
  const realizedPLPercent = entryPrice !== 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;
  const won = realizedPL >= 0;
  const positionSize = entryPrice * quantity;

  const riskPercent =
    plannedStopLoss !== undefined && plannedStopLoss < entryPrice
      ? ((entryPrice - plannedStopLoss) / entryPrice) * 100
      : null;

  const rewardPercent =
    plannedTakeProfit !== undefined && plannedTakeProfit > entryPrice
      ? ((plannedTakeProfit - entryPrice) / entryPrice) * 100
      : null;

  const riskRewardRatio =
    riskPercent !== null && riskPercent > 0 && rewardPercent !== null
      ? rewardPercent / riskPercent
      : null;

  const holdingStyle = classifyHoldingStyle(holdingDurationMs);
  const holdingDurationLabel = formatDuration(holdingDurationMs);

  const insights: CoachInsight[] = [];

  // No stop loss defined
  if (plannedStopLoss === undefined) {
    insights.push({
      kind: 'mistake',
      message:
        'No stop loss was set for this trade. A predefined stop loss limits downside before you enter, removing the need for an in-the-moment decision.',
      lessonTopicId: 'risk-management',
    });
  } else if (riskPercent !== null && riskPercent > 5) {
    insights.push({
      kind: 'mistake',
      message: `Your stop loss was ${riskPercent.toFixed(1)}% below entry — wider than the commonly used 1-2% guideline. A wide stop increases how much a single trade can cost you.`,
      lessonTopicId: 'risk-management',
    });
  } else if (riskPercent !== null) {
    insights.push({
      kind: 'positive',
      message: `Your stop loss risked ${riskPercent.toFixed(1)}% of entry price, in line with disciplined position sizing.`,
    });
  }

  // Reward/Risk ratio
  if (riskRewardRatio !== null) {
    if (riskRewardRatio < 1) {
      insights.push({
        kind: 'mistake',
        message: `Your planned reward/risk ratio was ${riskRewardRatio.toFixed(2)}:1 — below 1:1 means you needed to win more than half your trades just to break even.`,
        lessonTopicId: 'risk-management',
      });
    } else {
      insights.push({
        kind: 'positive',
        message: `Your planned reward/risk ratio was ${riskRewardRatio.toFixed(2)}:1, giving you room to be profitable even without a high win rate.`,
      });
    }
  }

  // Won but exited well short of the take-profit target
  if (won && plannedTakeProfit !== undefined && rewardPercent !== null && rewardPercent > 0) {
    const capturedFraction = realizedPLPercent / rewardPercent;
    if (capturedFraction < 0.5) {
      insights.push({
        kind: 'mistake',
        message: `You captured only ${Math.max(0, capturedFraction * 100).toFixed(0)}% of your planned target before exiting. Consistently cutting winners early can hurt long-run results even when individual trades are profitable.`,
        lessonTopicId: 'trading-psychology',
      });
    }
  }

  // Lost and held far longer than the position's apparent style suggests
  if (!won && holdingStyle === 'Position' && riskPercent !== null && Math.abs(realizedPLPercent) > riskPercent * 1.5) {
    insights.push({
      kind: 'mistake',
      message: `This trade lost more than your planned risk and was held for ${holdingDurationLabel} — a sign the stop loss may not have been honored, or the plan changed mid-trade.`,
      lessonTopicId: 'trading-psychology',
    });
  }

  // Very short losing trade — possible impulsive entry/exit
  if (!won && holdingDurationMs < 2 * MINUTE) {
    insights.push({
      kind: 'neutral',
      message: `This position was closed in ${holdingDurationLabel}. Very fast exits are sometimes a sign of reacting to noise rather than a planned setup — worth reviewing whether the entry followed your plan.`,
      lessonTopicId: 'trading-psychology',
    });
  }

  if (insights.length === 0) {
    insights.push({
      kind: won ? 'positive' : 'neutral',
      message: won
        ? 'This trade followed sound structure with no major issues detected.'
        : 'No specific mistakes detected — sometimes a well-planned trade still loses. That is a normal part of trading.',
    });
  }

  const summary = won
    ? `This trade closed profitably, gaining ${realizedPLPercent.toFixed(2)}% over ${holdingDurationLabel} (${holdingStyle.toLowerCase()} style). Past results don't guarantee future ones — the goal is repeating the process, not the outcome.`
    : `This trade closed at a loss of ${Math.abs(realizedPLPercent).toFixed(2)}% over ${holdingDurationLabel} (${holdingStyle.toLowerCase()} style). Losses are a normal part of trading — what matters is whether your process and risk management held up.`;

  return {
    realizedPL,
    realizedPLPercent,
    won,
    positionSize,
    riskPercent,
    rewardPercent,
    riskRewardRatio,
    holdingStyle,
    holdingDurationLabel,
    summary,
    insights,
  };
}
