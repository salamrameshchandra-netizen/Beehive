import { BatterStance, CRICKET_SPECS, ViewPerspective, ZoneClassification } from '../types/cricket';

/**
 * Classifies a ball at the stumps plane (xCm, yCm) relative to middle stump and ground.
 * xCm: negative is Off side for RHB (from bowler's viewpoint), positive is Leg side.
 */
export function classifyBallZone(
  xCm: number,
  yCm: number,
  stance: BatterStance = 'RHB'
): ZoneClassification {
  const safeX = Number.isFinite(xCm) ? xCm : 0;
  const safeY = Number.isFinite(yCm) ? yCm : 0;

  // Normalize lateral so that "off side" is always negative for calculation
  const effectiveX = stance === 'RHB' ? safeX : -safeX;

  let lineZone: ZoneClassification['lineZone'];
  if (effectiveX < -CRICKET_SPECS.OFF_WIDE_LINE_CM) {
    lineZone = 'wide-off';
  } else if (effectiveX < -CRICKET_SPECS.OFF_STUMP_OFFSET_CM) {
    lineZone = 'corridor-outside-off';
  } else if (effectiveX <= CRICKET_SPECS.LEG_STUMP_OFFSET_CM) {
    lineZone = 'stumps';
  } else if (effectiveX <= CRICKET_SPECS.LEG_WIDE_LINE_CM + 15) {
    lineZone = 'on-pads';
  } else if (effectiveX <= 60) {
    lineZone = 'down-leg';
  } else {
    lineZone = 'wide-leg';
  }

  let heightZone: ZoneClassification['heightZone'];
  if (safeY <= 18) {
    heightZone = 'toes-yorker';
  } else if (safeY <= 45) {
    heightZone = 'shins';
  } else if (safeY <= CRICKET_SPECS.TOTAL_WICKET_HEIGHT_CM + 4) {
    heightZone = 'knee-roll-stumps';
  } else if (safeY <= 110) {
    heightZone = 'waist';
  } else if (safeY <= 145) {
    heightZone = 'chest';
  } else if (safeY <= 185) {
    heightZone = 'helmet';
  } else {
    heightZone = 'over-head';
  }

  // Stump hit detection
  const isHittingStumps =
    safeY >= 0 &&
    safeY <= CRICKET_SPECS.TOTAL_WICKET_HEIGHT_CM &&
    Math.abs(safeX) <= CRICKET_SPECS.OFF_STUMP_OFFSET_CM + 3.0; // including ball radius buffer

  let whichStump: ZoneClassification['whichStump'] = 'misses';
  if (isHittingStumps) {
    if (safeY > CRICKET_SPECS.STUMP_HEIGHT_CM) {
      whichStump = 'bails';
    } else {
      // Off vs Middle vs Leg
      const stumpThreshold = CRICKET_SPECS.STUMP_WIDTH_CM / 6; // 3.8 cm
      if (effectiveX < -stumpThreshold) {
        whichStump = 'off';
      } else if (effectiveX > stumpThreshold) {
        whichStump = 'leg';
      } else {
        whichStump = 'middle';
      }
    }
  }

  // Descriptive label
  const sideLabel =
    Math.abs(safeX) < 3.5
      ? 'Middle stump'
      : effectiveX < 0
      ? `${Math.abs(effectiveX).toFixed(1)}cm outside off`
      : `${Math.abs(effectiveX).toFixed(1)}cm down leg`;

  const hLabel =
    safeY < 20
      ? 'Yorker (boots)'
      : safeY < 50
      ? 'Low (shins)'
      : safeY <= CRICKET_SPECS.TOTAL_WICKET_HEIGHT_CM
      ? 'Stump height (knee roll)'
      : safeY < 115
      ? 'Thigh/Waist'
      : safeY < 155
      ? 'Chest height'
      : 'Bouncer (helmet)';

  const label = `${sideLabel} · ${hLabel}${isHittingStumps ? ' [HITTING]' : ''}`;

  return {
    lineZone,
    heightZone,
    isHittingStumps,
    whichStump,
    label,
  };
}

/**
 * Calculates display coordinates from real world (cm) to SVG space
 * World Bounds:
 * X: -100 cm to +100 cm (width 200)
 * Y: 0 cm to 200 cm (height 200)
 */
export const SVG_CONFIG = {
  viewBoxWidth: 800,
  viewBoxHeight: 700,
  minXCm: -100,
  maxXCm: 100,
  minYCm: 0,
  maxYCm: 200,
  paddingBottom: 50,
  paddingSides: 50,
};

export function realToSvg(
  xCm: number,
  yCm: number,
  perspective: ViewPerspective = 'bowler'
): { svgX: number; svgY: number } {
  const safeX = Number.isFinite(xCm) ? xCm : 0;
  const safeY = Number.isFinite(yCm) ? yCm : 0;

  // If viewing from batsman's perspective, lateral X is flipped
  const adjustedX = perspective === 'bowler' ? safeX : -safeX;

  const usableWidth = SVG_CONFIG.viewBoxWidth - SVG_CONFIG.paddingSides * 2;
  const usableHeight = SVG_CONFIG.viewBoxHeight - SVG_CONFIG.paddingBottom - 40;

  // Scale factors
  const scaleX = usableWidth / (SVG_CONFIG.maxXCm - SVG_CONFIG.minXCm);
  const scaleY = usableHeight / (SVG_CONFIG.maxYCm - SVG_CONFIG.minYCm);

  const rawSvgX = SVG_CONFIG.paddingSides + (adjustedX - SVG_CONFIG.minXCm) * scaleX;
  const rawSvgY = SVG_CONFIG.viewBoxHeight - SVG_CONFIG.paddingBottom - (safeY - SVG_CONFIG.minYCm) * scaleY;

  const svgX = Number.isFinite(rawSvgX) ? rawSvgX : SVG_CONFIG.viewBoxWidth / 2;
  const svgY = Number.isFinite(rawSvgY) ? rawSvgY : SVG_CONFIG.viewBoxHeight - SVG_CONFIG.paddingBottom;

  return { svgX, svgY };
}

export function svgToReal(
  svgX: number,
  svgY: number,
  perspective: ViewPerspective = 'bowler'
): { xCm: number; yCm: number } {
  const safeSvgX = Number.isFinite(svgX) ? svgX : SVG_CONFIG.viewBoxWidth / 2;
  const safeSvgY = Number.isFinite(svgY) ? svgY : SVG_CONFIG.viewBoxHeight / 2;

  const usableWidth = SVG_CONFIG.viewBoxWidth - SVG_CONFIG.paddingSides * 2;
  const usableHeight = SVG_CONFIG.viewBoxHeight - SVG_CONFIG.paddingBottom - 40;

  const scaleX = usableWidth / (SVG_CONFIG.maxXCm - SVG_CONFIG.minXCm);
  const scaleY = usableHeight / (SVG_CONFIG.maxYCm - SVG_CONFIG.minYCm);

  let adjustedX = (safeSvgX - SVG_CONFIG.paddingSides) / scaleX + SVG_CONFIG.minXCm;
  const yCm = (SVG_CONFIG.viewBoxHeight - SVG_CONFIG.paddingBottom - safeSvgY) / scaleY;

  const xCm = perspective === 'bowler' ? adjustedX : -adjustedX;

  const numX = Number(xCm.toFixed(1));
  const numY = Number(yCm.toFixed(1));

  // Clamp within boundaries and ensure finite numbers
  const clampedX = Number.isFinite(numX) ? Math.max(SVG_CONFIG.minXCm, Math.min(SVG_CONFIG.maxXCm, numX)) : 0;
  const clampedY = Number.isFinite(numY) ? Math.max(0, Math.min(SVG_CONFIG.maxYCm, numY)) : 0;

  return { xCm: clampedX, yCm: clampedY };
}

/**
 * Format outcome for display
 */
export function getOutcomeColor(outcome: string): { bg: string; text: string; dotColor: string; label: string } {
  if (outcome.startsWith('wicket')) {
    return { bg: 'bg-rose-500/15', text: 'text-rose-400', dotColor: '#ef4444', label: 'Wicket' };
  }
  switch (outcome) {
    case '4':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', dotColor: '#f59e0b', label: 'Four' };
    case '6':
      return { bg: 'bg-purple-500/15', text: 'text-purple-400', dotColor: '#a855f7', label: 'Six' };
    case '1':
    case '2':
    case '3':
      return { bg: 'bg-sky-500/15', text: 'text-sky-400', dotColor: '#38bdf8', label: `${outcome} Runs` };
    case 'dot':
    default:
      return { bg: 'bg-slate-500/15', text: 'text-slate-400', dotColor: '#94a3b8', label: 'Dot' };
  }
}
