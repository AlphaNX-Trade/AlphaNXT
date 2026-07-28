import type { LearningTopic } from '@/lib/learnTypes';

/**
 * Static content for the Learning Academy.
 * 12 topics across Beginner / Intermediate / Advanced, each with a written
 * lesson and a 4-question quiz. XP is only awarded once, on first completion
 * (enforced in learnService.ts, not here).
 */
export const LEARNING_TOPICS: LearningTopic[] = [
  // ── BEGINNER ────────────────────────────────────────────────────────────
  {
    id: 'candlesticks',
    title: 'Candlesticks',
    level: 'Beginner',
    summary: 'Read the story a single candle tells about price action.',
    xpReward: 50,
    content: [
      'A candlestick shows four prices for a time period: the open, high, low, and close. The thick part is called the "body" and the thin lines above/below are "wicks" or "shadows".',
      'A green (or hollow) candle means the close was higher than the open — buyers were in control. A red (or filled) candle means the close was lower than the open — sellers were in control.',
      'Long wicks show rejection: a long upper wick means price pushed up but was pushed back down; a long lower wick means the opposite. Small bodies with long wicks (like a Doji) signal indecision between buyers and sellers.',
      'Candlestick patterns like Hammer, Engulfing, and Doji are used alongside other tools — never in isolation — to gauge short-term sentiment.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What does a green candle indicate?',
        options: ['Close was higher than open', 'Close was lower than open', 'No trading occurred', 'Price was flat all session'],
        correctIndex: 0,
        explanation: 'A green (or hollow) candle means the closing price was above the opening price — net buying pressure.',
      },
      {
        id: 'q2',
        question: 'A candle with a long lower wick and small body suggests:',
        options: ['Strong continued selling', 'Buyers rejected lower prices', 'The market was closed', 'A guaranteed reversal'],
        correctIndex: 1,
        explanation: 'A long lower wick shows price was pushed down but buyers stepped in and pushed it back up before the close.',
      },
      {
        id: 'q3',
        question: 'What is the thick part of a candlestick called?',
        options: ['The wick', 'The shadow', 'The body', 'The tail'],
        correctIndex: 2,
        explanation: 'The body represents the range between the open and close prices.',
      },
      {
        id: 'q4',
        question: 'Candlestick patterns should be used:',
        options: ['As the only signal for every trade', 'In isolation from other analysis', 'Alongside other tools like trend and volume', 'Only on weekly charts'],
        correctIndex: 2,
        explanation: 'Candlestick signals are probabilistic and work best combined with trend, support/resistance, and volume context.',
      },
    ],
  },
  {
    id: 'support-resistance',
    title: 'Support & Resistance',
    level: 'Beginner',
    summary: 'Identify the price zones where buyers and sellers repeatedly clash.',
    xpReward: 50,
    content: [
      'Support is a price level where buying pressure has historically been strong enough to stop a decline. Resistance is a level where selling pressure has historically stopped an advance.',
      'These are zones, not exact lines — price often pierces slightly through a level before reversing. Look for areas where price reversed multiple times in the past.',
      'When resistance is broken with strong volume, it often becomes new support (this is called a "role reversal"). The same applies to broken support becoming new resistance.',
      'The more times a level has been tested without breaking, the more significant it becomes to traders watching the same chart — this is partly self-fulfilling because many participants are watching the same levels.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Support is best described as:',
        options: ['A price ceiling', 'A price floor where buying has historically emerged', 'A moving average', 'A type of order'],
        correctIndex: 1,
        explanation: 'Support is a zone where demand has historically been strong enough to halt declines.',
      },
      {
        id: 'q2',
        question: 'When resistance is broken with strong volume, it often becomes:',
        options: ['Irrelevant', 'New support', 'A new resistance further up only', 'A stop-loss zone automatically'],
        correctIndex: 1,
        explanation: 'This "role reversal" is a well-documented pattern — old resistance frequently acts as new support once broken.',
      },
      {
        id: 'q3',
        question: 'Support and resistance levels are best thought of as:',
        options: ['Exact single prices', 'Zones or ranges', 'Only visible on daily charts', 'Irrelevant once drawn'],
        correctIndex: 1,
        explanation: 'Price often overshoots slightly, so treating these as zones rather than exact lines avoids being faked out.',
      },
      {
        id: 'q4',
        question: 'A level tested many times without breaking is generally considered:',
        options: ['Weaker each time', 'Less important', 'More significant', 'Irrelevant to risk management'],
        correctIndex: 2,
        explanation: 'Repeated tests without a break increase the level\'s significance to market participants watching it.',
      },
    ],
  },
  {
    id: 'volume',
    title: 'Volume',
    level: 'Beginner',
    summary: 'Learn why "volume confirms price" is one of trading\'s oldest rules.',
    xpReward: 50,
    content: [
      'Volume measures how many shares or contracts changed hands in a period. It reflects the conviction behind a price move.',
      'A price move on high volume is considered more reliable than the same move on low volume, because more participants agreed with the direction.',
      'Rising prices on falling volume can be a warning sign — the move may be running out of participation and could reverse.',
      'Volume spikes often accompany breakouts, earnings announcements, or news events, and can mark the start or end of a trend.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What does volume measure?',
        options: ['Price volatility only', 'Number of shares/contracts traded', 'The spread between bid and ask', 'Company market cap'],
        correctIndex: 1,
        explanation: 'Volume is a count of how many units were traded in a given period.',
      },
      {
        id: 'q2',
        question: 'A price rise on falling volume is often seen as:',
        options: ['A strong healthy trend', 'A warning of weakening participation', 'Irrelevant information', 'Proof of a coming breakout'],
        correctIndex: 1,
        explanation: 'Divergence between rising price and falling volume can signal the move lacks broad conviction.',
      },
      {
        id: 'q3',
        question: 'Volume spikes commonly occur around:',
        options: ['Random days with no cause', 'Earnings announcements and news events', 'Only on Mondays', 'Only during weekends'],
        correctIndex: 1,
        explanation: 'Scheduled or surprise news tends to draw in many participants at once, spiking volume.',
      },
      {
        id: 'q4',
        question: '"Volume confirms price" generally means:',
        options: ['High volume moves are more reliable', 'Low volume moves are always fake', 'Volume predicts exact future prices', 'Volume and price are unrelated'],
        correctIndex: 0,
        explanation: 'Higher volume behind a move suggests broader participant agreement, adding reliability to the signal.',
      },
    ],
  },
  {
    id: 'trading-psychology',
    title: 'Trading Psychology',
    level: 'Beginner',
    summary: 'The mental game that decides most trading outcomes.',
    xpReward: 50,
    content: [
      'Most trading losses come from emotional decisions, not bad analysis: fear of missing out (FOMO), revenge trading after a loss, and holding losers too long out of hope.',
      'A trading plan written in advance — entry, exit, stop loss, and position size — removes emotion from the moment of decision. The plan should be made calmly, before the trade, not adjusted mid-trade under stress.',
      'Loss aversion is a well-documented bias where the pain of losing feels roughly twice as strong as the pleasure of an equivalent gain. This bias causes traders to cut winners early and let losers run — the opposite of what a sound strategy requires.',
      'Journaling every trade (why you entered, what happened, what you\'d do differently) is one of the most effective tools for improving decision-making over time.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Revenge trading refers to:',
        options: ['A disciplined strategy', 'Trading impulsively to "win back" a recent loss', 'A type of stop-loss order', 'A technical indicator'],
        correctIndex: 1,
        explanation: 'Revenge trading is an emotional reaction to a loss, usually leading to poorly planned, oversized trades.',
      },
      {
        id: 'q2',
        question: 'Why should a trading plan be made before entering a trade?',
        options: ['It removes emotion from the decision', 'It guarantees a profit', 'It is required by regulators', 'It has no real benefit'],
        correctIndex: 0,
        explanation: 'Decisions made calmly in advance are far less likely to be swayed by fear or greed in the moment.',
      },
      {
        id: 'q3',
        question: 'Loss aversion tends to cause traders to:',
        options: ['Cut winners early and let losers run', 'Cut losers early and let winners run', 'Ignore all trades', 'Trade only on weekends'],
        correctIndex: 0,
        explanation: 'Because losses feel more painful than equivalent gains feel good, traders often do the opposite of sound risk management.',
      },
      {
        id: 'q4',
        question: 'What is the main benefit of keeping a trade journal?',
        options: ['It guarantees future profits', 'It helps identify patterns in your own decision-making', 'It is only useful for taxes', 'It replaces the need for a strategy'],
        correctIndex: 1,
        explanation: 'Reviewing past trades honestly is one of the most reliable ways to spot recurring mistakes and improve.',
      },
    ],
  },

  // ── INTERMEDIATE ────────────────────────────────────────────────────────
  {
    id: 'price-action',
    title: 'Price Action',
    level: 'Intermediate',
    summary: 'Trade what the chart is actually doing, not what an indicator predicts.',
    xpReward: 75,
    content: [
      'Price action trading means making decisions primarily from the raw movement of price — candle patterns, structure, and support/resistance — rather than lagging indicators.',
      'Market structure is described as a sequence of highs and lows: an uptrend makes higher highs and higher lows; a downtrend makes lower highs and lower lows. A break in this sequence is often the first sign of a trend change.',
      'Consolidation (or "ranging") happens when neither buyers nor sellers are in clear control — price moves sideways between a support and resistance zone until one side wins.',
      'Because price action relies on interpretation, it benefits from combining with volume and higher-timeframe context to avoid overreacting to noise.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'An uptrend in market structure is defined by:',
        options: ['Lower highs and lower lows', 'Higher highs and higher lows', 'Flat prices only', 'Random price movement'],
        correctIndex: 1,
        explanation: 'A sequence of rising highs and rising lows is the textbook definition of an uptrend in price action analysis.',
      },
      {
        id: 'q2',
        question: 'A break in the higher-highs/higher-lows sequence often signals:',
        options: ['Nothing significant', 'A possible trend change', 'A guaranteed reversal', 'A data error'],
        correctIndex: 1,
        explanation: 'Structure breaks are one of the earliest warning signs that the prevailing trend may be losing control.',
      },
      {
        id: 'q3',
        question: 'What characterizes a consolidation/ranging market?',
        options: ['Strong one-directional trend', 'Price moving sideways between support and resistance', 'Extremely low volume always', 'Only occurs after earnings'],
        correctIndex: 1,
        explanation: 'Ranging markets reflect a temporary balance between buyers and sellers.',
      },
      {
        id: 'q4',
        question: 'Price action analysis primarily relies on:',
        options: ['Lagging indicators only', 'Raw price movement and structure', 'Company fundamentals only', 'Social media sentiment only'],
        correctIndex: 1,
        explanation: 'Price action traders read the chart itself — candles, structure, key levels — rather than derived indicators.',
      },
    ],
  },
  {
    id: 'ema',
    title: 'EMA (Exponential Moving Average)',
    level: 'Intermediate',
    summary: 'A moving average that reacts faster to recent price changes.',
    xpReward: 75,
    content: [
      'A moving average smooths price into a single line to reveal trend direction. The EMA weights recent prices more heavily than older ones, so it reacts faster than a Simple Moving Average (SMA).',
      'Common periods are the 9, 20, 50, and 200 EMA. Shorter EMAs are more sensitive (more signals, more noise); longer EMAs are smoother but slower to react.',
      'When a shorter EMA crosses above a longer EMA, it\'s called a "golden cross" and is often read as bullish; the opposite is a "death cross", often read as bearish. These are lagging signals, not predictions.',
      'Price staying consistently above a rising EMA is often used as a simple trend filter; consistently below a falling EMA suggests the opposite.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Compared to a Simple Moving Average, an EMA:',
        options: ['Weighs all prices equally', 'Weights recent prices more heavily', 'Ignores recent prices', 'Cannot be plotted on a chart'],
        correctIndex: 1,
        explanation: 'The "exponential" weighting gives more influence to the most recent price data, making the EMA react faster.',
      },
      {
        id: 'q2',
        question: 'A "golden cross" refers to:',
        options: ['A short EMA crossing below a long EMA', 'A short EMA crossing above a long EMA', 'Price hitting an all-time high', 'A candlestick pattern'],
        correctIndex: 1,
        explanation: 'A golden cross is a shorter-period EMA/SMA crossing above a longer-period one, often interpreted as bullish.',
      },
      {
        id: 'q3',
        question: 'Shorter-period EMAs generally produce:',
        options: ['Fewer signals with less noise', 'More signals with more noise', 'No signals at all', 'Only weekly signals'],
        correctIndex: 1,
        explanation: 'Shorter EMAs react quickly to price, which means more crossovers and more false signals in choppy markets.',
      },
      {
        id: 'q4',
        question: 'Moving average crossovers are best described as:',
        options: ['Leading indicators that predict the future', 'Lagging signals based on past price', 'Guaranteed trade signals', 'Only usable on forex'],
        correctIndex: 1,
        explanation: 'Because EMAs are calculated from past prices, crossovers confirm a trend after it has already started — they lag.',
      },
    ],
  },
  {
    id: 'rsi',
    title: 'RSI (Relative Strength Index)',
    level: 'Intermediate',
    summary: 'A momentum oscillator that flags overbought and oversold conditions.',
    xpReward: 75,
    content: [
      'RSI is a momentum oscillator that ranges from 0 to 100, calculated from the average size of recent gains versus losses, typically over 14 periods.',
      'Readings above 70 are traditionally considered "overbought" and readings below 30 "oversold" — but in a strong trend, RSI can stay extreme for a long time, so these levels are not automatic reversal signals.',
      'Divergence is a key concept: if price makes a new high but RSI makes a lower high, it can signal weakening momentum even though price is still rising.',
      'RSI works best combined with trend and structure — using "overbought" alone as a sell signal in a strong uptrend has historically caused traders to exit winning positions far too early.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'The RSI value range is:',
        options: ['-100 to 100', '0 to 100', '0 to 10', 'Unbounded'],
        correctIndex: 1,
        explanation: 'RSI is normalized to a 0–100 scale, making overbought/oversold comparisons consistent across assets.',
      },
      {
        id: 'q2',
        question: 'An RSI reading above 70 is traditionally read as:',
        options: ['Oversold', 'Overbought', 'A guaranteed sell signal', 'Neutral'],
        correctIndex: 1,
        explanation: 'Above 70 is the traditional overbought threshold, though it can persist in strong trends.',
      },
      {
        id: 'q3',
        question: 'Bearish RSI divergence occurs when:',
        options: ['Price and RSI both make new highs', 'Price makes a new high but RSI makes a lower high', 'RSI is flat', 'Price falls and RSI falls'],
        correctIndex: 1,
        explanation: 'This mismatch suggests momentum is fading even as price pushes to new highs — a possible early warning.',
      },
      {
        id: 'q4',
        question: 'Using "overbought" alone as a sell signal in a strong uptrend can:',
        options: ['Always produce profits', 'Cause traders to exit winners too early', 'Have no downside', 'Guarantee a reversal'],
        correctIndex: 1,
        explanation: 'Strong trends can keep RSI extreme for extended periods, so relying on this alone often exits positions prematurely.',
      },
    ],
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    level: 'Intermediate',
    summary: 'The single most important skill separating consistent traders from the rest.',
    xpReward: 75,
    content: [
      'Position sizing determines how much of your capital is at risk on a single trade. A common guideline is risking no more than 1-2% of total capital on any one trade.',
      'The Risk/Reward ratio compares potential loss to potential gain. A 1:2 risk/reward means risking ₹1 to potentially make ₹2 — with this ratio, a trader can be profitable even winning less than half their trades.',
      'A stop loss is a predetermined exit point that limits losses on a losing trade. Setting it before entering — and never moving it further away once in the trade — is core discipline.',
      'Diversification (not concentrating capital in one asset or sector) and avoiding oversized positions during high volatility are additional layers of protecting capital.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A common position-sizing guideline is to risk no more than:',
        options: ['50% of capital per trade', '1-2% of capital per trade', '100% of capital per trade', '25% of capital per trade'],
        correctIndex: 1,
        explanation: 'Risking a small, consistent percentage per trade protects capital from a string of losses.',
      },
      {
        id: 'q2',
        question: 'With a 1:2 risk/reward ratio, a trader can be profitable:',
        options: ['Only by winning every trade', 'Even while winning less than half their trades', 'Only in bull markets', 'Only with leverage'],
        correctIndex: 1,
        explanation: 'Because wins are worth twice the losses, the breakeven win rate drops below 50%.',
      },
      {
        id: 'q3',
        question: 'A stop loss should generally be:',
        options: ['Set after entering the trade based on feeling', 'Set before entering and left in place', 'Moved further away if the trade goes against you', 'Avoided entirely'],
        correctIndex: 1,
        explanation: 'Deciding the exit in advance and honoring it removes emotional decision-making from a losing trade.',
      },
      {
        id: 'q4',
        question: 'Concentrating all capital into one asset increases:',
        options: ['Diversification', 'Single-asset risk exposure', 'Guaranteed returns', 'Nothing of concern'],
        correctIndex: 1,
        explanation: 'Lack of diversification means one bad outcome can disproportionately damage the whole portfolio.',
      },
    ],
  },

  // ── ADVANCED ─────────────────────────────────────────────────────────────
  {
    id: 'macd',
    title: 'MACD',
    level: 'Advanced',
    summary: 'A trend-following momentum indicator built from two EMAs.',
    xpReward: 100,
    content: [
      'MACD (Moving Average Convergence Divergence) is calculated by subtracting a 26-period EMA from a 12-period EMA, producing the "MACD line". A 9-period EMA of that line forms the "signal line".',
      'The "histogram" plots the difference between the MACD line and the signal line, visually showing momentum acceleration or deceleration.',
      'A MACD line crossing above the signal line is often read as bullish momentum; crossing below is often read as bearish — similar in spirit to the EMA crossover, but built specifically to highlight momentum shifts.',
      'Like RSI, MACD divergence (price and MACD moving in opposite directions) can flag weakening momentum before price confirms it — but MACD is a lagging indicator built from moving averages, so it works best confirming a thesis, not predicting one alone.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'The MACD line is calculated from:',
        options: ['RSI minus 50', 'The difference between a 12-period and 26-period EMA', 'Volume divided by price', 'A single moving average'],
        correctIndex: 1,
        explanation: 'MACD Line = 12-period EMA − 26-period EMA.',
      },
      {
        id: 'q2',
        question: 'The MACD histogram represents:',
        options: ['Raw trading volume', 'The gap between the MACD line and signal line', 'The stock\'s market cap', 'Support and resistance zones'],
        correctIndex: 1,
        explanation: 'The histogram visualizes how far apart the MACD line and signal line are, showing momentum strength.',
      },
      {
        id: 'q3',
        question: 'MACD line crossing above the signal line is typically read as:',
        options: ['Bearish momentum', 'Bullish momentum', 'No signal at all', 'A volume spike'],
        correctIndex: 1,
        explanation: 'This crossover is one of the most common bullish momentum signals derived from MACD.',
      },
      {
        id: 'q4',
        question: 'MACD is best described as:',
        options: ['A leading indicator with no lag', 'A lagging indicator built from moving averages', 'A volume indicator', 'A candlestick pattern'],
        correctIndex: 1,
        explanation: 'Since MACD is derived from EMAs of past prices, it lags price and works best confirming, not predicting.',
      },
    ],
  },
  {
    id: 'breakouts',
    title: 'Breakouts',
    level: 'Advanced',
    summary: 'Trading the moment price escapes a well-defined range.',
    xpReward: 100,
    content: [
      'A breakout occurs when price moves beyond a defined support/resistance level or chart pattern (like a triangle or range) with conviction.',
      'Volume is critical for validating a breakout — a move through resistance on weak volume is far more likely to fail ("false breakout") than one on strong volume.',
      'A "retest" is when price breaks out, then returns to test the broken level before continuing in the breakout direction. Many traders wait for a successful retest as extra confirmation before entering.',
      'False breakouts are common enough that risk management (a stop just inside the broken level) is essential — breakout trading has a real failure rate even with good technique.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What confirms a breakout is more likely genuine?',
        options: ['Weak volume', 'Strong volume', 'No volume data', 'Only time of day'],
        correctIndex: 1,
        explanation: 'Strong volume behind a breakout indicates broad participation, increasing the odds it holds.',
      },
      {
        id: 'q2',
        question: 'A "retest" after a breakout refers to:',
        options: ['Price immediately reversing fully', 'Price returning to test the broken level before continuing', 'A second, unrelated breakout', 'A type of stop-loss order'],
        correctIndex: 1,
        explanation: 'Retests give traders a second, often lower-risk entry opportunity after the initial breakout.',
      },
      {
        id: 'q3',
        question: 'A "false breakout" is when:',
        options: ['Price breaks a level and reverses back inside the range', 'Price breaks a level and continues strongly', 'Volume spikes on the breakout', 'The market is closed'],
        correctIndex: 0,
        explanation: 'False breakouts trap traders who entered expecting continuation, only for price to reverse back.',
      },
      {
        id: 'q4',
        question: 'Because false breakouts are common, traders typically:',
        options: ['Skip stop losses entirely', 'Place a stop just inside the broken level', 'Increase position size to compensate', 'Ignore volume completely'],
        correctIndex: 1,
        explanation: 'A stop near the broken level limits losses if the breakout fails, without giving up too much room.',
      },
    ],
  },
  {
    id: 'swing-trading',
    title: 'Swing Trading',
    level: 'Advanced',
    summary: 'Capturing multi-day to multi-week price swings.',
    xpReward: 100,
    content: [
      'Swing trading holds positions for several days to several weeks, aiming to capture a meaningful chunk of a trend rather than every tick.',
      'It typically relies on daily or 4-hour charts, combining trend direction, key support/resistance, and momentum indicators like RSI or MACD to time entries.',
      'Because positions are held overnight, swing traders are exposed to gap risk — price can open significantly away from the previous close due to news. Wider stops and smaller position sizes are common ways to manage this.',
      'Swing trading generally requires less screen time than day trading, making it more accessible to people with full-time jobs, but it demands patience to let trades develop over days.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A typical swing trade holding period is:',
        options: ['Seconds to minutes', 'Several days to several weeks', 'Multiple years', 'Exactly one hour'],
        correctIndex: 1,
        explanation: 'Swing trading sits between day trading and long-term investing, targeting multi-day to multi-week moves.',
      },
      {
        id: 'q2',
        question: 'A key risk unique to holding positions overnight is:',
        options: ['Commission fees', 'Gap risk from news moving price outside market hours', 'Zero risk since markets are closed', 'Guaranteed losses'],
        correctIndex: 1,
        explanation: 'Overnight news can cause the next open to be significantly different from the prior close, skipping past any intraday stop.',
      },
      {
        id: 'q3',
        question: 'Swing traders commonly manage gap risk by:',
        options: ['Ignoring position size entirely', 'Using wider stops and smaller position sizes', 'Never using stop losses', 'Trading only during gaps'],
        correctIndex: 1,
        explanation: 'Sizing positions to account for potential overnight gaps helps limit worst-case losses.',
      },
      {
        id: 'q4',
        question: 'Compared to day trading, swing trading generally requires:',
        options: ['More constant screen time', 'Less constant screen time', 'No chart analysis at all', 'Trading only on weekends'],
        correctIndex: 1,
        explanation: 'Because trades develop over days, swing traders don\'t need to watch every intraday tick.',
      },
    ],
  },
  {
    id: 'scalping',
    title: 'Scalping',
    level: 'Advanced',
    summary: 'The fastest, highest-frequency style of trading — small gains, many trades.',
    xpReward: 100,
    content: [
      'Scalping targets very small price movements, often holding positions for seconds to a few minutes, with the goal of accumulating many small wins.',
      'It requires tight spreads, low transaction costs, and fast execution — costs that would be negligible for a swing trader can eat up most of a scalper\'s profit.',
      'Because each individual trade risks very little, scalping typically requires strict, mechanical rules and fast decision-making, leaving little room for hesitation or emotional deliberation.',
      'Scalping is demanding and high-stress; it is generally considered one of the harder styles to execute consistently, especially for beginners, since it compounds the psychological pressure of trading many times per session.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A typical scalp trade is held for:',
        options: ['Weeks', 'Seconds to a few minutes', 'Months', 'Years'],
        correctIndex: 1,
        explanation: 'Scalping is defined by extremely short holding periods aiming to capture very small moves repeatedly.',
      },
      {
        id: 'q2',
        question: 'Why are transaction costs especially important for scalpers?',
        options: ['They don\'t matter at all', 'Small profit targets mean costs can consume most of the gain', 'Scalpers never pay fees', 'Costs only affect swing traders'],
        correctIndex: 1,
        explanation: 'With very small target profits per trade, even modest fees or spreads can erode most of the edge.',
      },
      {
        id: 'q3',
        question: 'Scalping generally requires:',
        options: ['Loose, flexible rules', 'Strict, mechanical rules and fast decisions', 'No risk management', 'Holding through news events for days'],
        correctIndex: 1,
        explanation: 'The speed and volume of trades leaves little room for slow, deliberative decision-making.',
      },
      {
        id: 'q4',
        question: 'Scalping is generally considered:',
        options: ['The easiest style for beginners', 'One of the more demanding, high-stress styles', 'Risk-free', 'Identical to long-term investing'],
        correctIndex: 1,
        explanation: 'The pace and psychological pressure of frequent, fast decisions make scalping challenging to execute consistently.',
      },
    ],
  },
];

export function getTopicById(id: string): LearningTopic | undefined {
  return LEARNING_TOPICS.find((t) => t.id === id);
}

export function getTopicsByLevel(level: LearningTopic['level']): LearningTopic[] {
  return LEARNING_TOPICS.filter((t) => t.level === level);
}
