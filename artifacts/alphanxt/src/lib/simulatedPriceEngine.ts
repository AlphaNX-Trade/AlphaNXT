import { useEffect, useRef, useState } from 'react';

export interface SimPoint {
  time: number; // seq index, not a real timestamp
  price: number;
}

/**
 * Generates a continuously-moving price series around a reference price —
 * NOT real market data. Used purely so the trade screen doesn't look static
 * when live data isn't available. Mean-reverting so it never drifts far from
 * the real static reference price, and the UI must always label this
 * "Simulated" (never "Live") wherever it's shown — see LiveChart.tsx.
 */
export function useSimulatedPriceSeries(basePrice: number, active: boolean, pointCount = 40): SimPoint[] {
  const [series, setSeries] = useState<SimPoint[]>([]);
  const priceRef = useRef(basePrice);
  const seqRef = useRef(0);

  // Reseed whenever the reference price changes meaningfully (e.g. switched asset)
  useEffect(() => {
    priceRef.current = basePrice;
    seqRef.current = 0;
    const seeded: SimPoint[] = [];
    let p = basePrice;
    for (let i = 0; i < pointCount; i++) {
      const drift = (Math.random() - 0.5) * basePrice * 0.0006;
      p = p + drift;
      seeded.push({ time: i, price: p });
    }
    seqRef.current = pointCount;
    setSeries(seeded);
  }, [basePrice, pointCount]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSeries((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1].price;
        // Small random step, gently pulled back toward the real reference
        // price so the simulation never wanders far from reality.
        const meanReversion = (basePrice - last) * 0.05;
        const noise = (Math.random() - 0.5) * basePrice * 0.0009;
        const next = last + meanReversion + noise;

        seqRef.current += 1;
        const nextPoint = { time: seqRef.current, price: next };
        return [...prev.slice(1), nextPoint];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [active, basePrice]);

  return series;
}
