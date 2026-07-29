export interface TradeAnalysisInput {
  symbol: string;
  companyName: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  /** Optional — only present if the user set a risk plan when opening the position. */
  plannedStopLoss?: number;
  plannedTakeProfit?: number;
  holdingDurationMs: number;
}

export type HoldingStyle = 'Scalp' | 'Intraday' | 'Swing' | 'Position';

export interface CoachInsight {
  /** 'mistake' shows in red/amber, 'positive' shows in green */
  kind: 'mistake' | 'positive' | 'neutral';
  message: string;
  /** Related Learning Academy topic id, if applicable */
  lessonTopicId?: string;
}

export interface TradeAnalysis {
  realizedPL: number;
  realizedPLPercent: number;
  won: boolean;
  positionSize: number;
  riskPercent: number | null;
  rewardPercent: number | null;
  riskRewardRatio: number | null;
  holdingStyle: HoldingStyle;
  holdingDurationLabel: string;
  summary: string;
  insights: CoachInsight[];
}
