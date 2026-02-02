import { ScalePoint } from '../types/question';

export interface InterpolationPattern {
  start: string[];
  end: string[];
  intermediates: string[];
}

const PATTERNS: InterpolationPattern[] = [
  {
    start: ['非常不同意', '很不同意', '不同意'],
    end: ['非常同意', '很同意', '同意'],
    intermediates: ['不同意', '中立', '同意'],
  },
  {
    start: ['非常不满意', '很不满意', '不满意'],
    end: ['非常满意', '很满意', '满意'],
    intermediates: ['不满意', '一般', '满意'],
  },
  {
    start: ['从不', '从来没有'],
    end: ['总是', '一直都是'],
    intermediates: ['很少', '有时', '经常'],
  },
  {
    start: ['非常差', '很差'],
    end: ['非常好', '很好'],
    intermediates: ['差', '一般', '好'],
  },
];

function findPattern(startLabel: string, endLabel: string): InterpolationPattern | null {
  for (const pattern of PATTERNS) {
    const startMatch = pattern.start.some(s => startLabel.includes(s) || s.includes(startLabel));
    const endMatch = pattern.end.some(e => endLabel.includes(e) || e.includes(endLabel));
    if (startMatch && endMatch) {
      return pattern;
    }
  }
  return null;
}

function interpolateLabels(
  startLabel: string,
  endLabel: string,
  numPoints: number
): string[] {
  const pattern = findPattern(startLabel, endLabel);

  if (pattern && numPoints <= 5) {
    // Use pattern intermediates for 5 or fewer points
    return distributePattern(pattern.intermediates, numPoints, startLabel, endLabel);
  } else if (pattern && numPoints <= 7) {
    // Use extended pattern for up to 7 points
    return distributePatternExtended(pattern.intermediates, numPoints, startLabel, endLabel);
  }

  // Fallback: numeric labels
  return Array.from({ length: numPoints }, (_, i) => {
    if (i === 0) return startLabel;
    if (i === numPoints - 1) return endLabel;
    return String(i + 1);
  });
}

function distributePattern(
  intermediates: string[],
  numPoints: number,
  startLabel: string,
  endLabel: string
): string[] {
  const result: string[] = [];

  for (let i = 0; i < numPoints; i++) {
    if (i === 0) {
      result.push(startLabel);
    } else if (i === numPoints - 1) {
      result.push(endLabel);
    } else {
      // Distribute across intermediates
      const index = Math.floor((i / (numPoints - 1)) * intermediates.length);
      const clampedIndex = Math.min(index, intermediates.length - 1);
      result.push(intermediates[clampedIndex]);
    }
  }

  return result;
}

function distributePatternExtended(
  intermediates: string[],
  numPoints: number,
  startLabel: string,
  endLabel: string
): string[] {
  const result: string[] = [];

  for (let i = 0; i < numPoints; i++) {
    if (i === 0) {
      result.push(startLabel);
    } else if (i === numPoints - 1) {
      result.push(endLabel);
    } else if (numPoints === 7) {
      // 7-point pattern: start, weak, medium, neutral, medium, strong, end
      const mid = Math.floor(intermediates.length / 2);
      if (i === 1 || i === numPoints - 2) {
        result.push(intermediates[0]); // weak
      } else if (i === 2 || i === numPoints - 3) {
        result.push(intermediates[1]); // medium
      } else {
        result.push(intermediates[mid]); // neutral
      }
    } else {
      // Fallback to numeric for other sizes
      result.push(String(i + 1));
    }
  }

  return result;
}

export function generateScale(
  startValue: number,
  endValue: number,
  startLabel: string,
  endLabel: string
): ScalePoint[] {
  const numPoints = endValue - startValue + 1;
  const labels = interpolateLabels(startLabel, endLabel, numPoints);

  return Array.from({ length: numPoints }, (_, i) => ({
    value: startValue + i,
    label: labels[i],
  }));
}
