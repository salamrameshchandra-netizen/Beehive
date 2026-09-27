export type BatterStance = 'RHB' | 'LHB';
export type ViewPerspective = 'bowler' | 'batter'; // bowler looking at stumps vs keeper/batter

export type BallOutcome =
  | 'dot'
  | '1'
  | '2'
  | '3'
  | '4'
  | '6'
  | 'wicket-bowled'
  | 'wicket-lbw'
  | 'wicket-caught-behind'
  | 'wicket-slips'
  | 'wicket-caught'
  | 'wicket-stumped'
  | 'wicket-run-out';

export type ContactType =
  | 'middle'
  | 'outside-edge'
  | 'inside-edge'
  | 'beaten'
  | 'leave'
  | 'pad';

export type DeliveryType =
  | 'outswinger'
  | 'inswinger'
  | 'seam-up'
  | 'yorker'
  | 'bouncer'
  | 'slower-ball'
  | 'off-break'
  | 'leg-break'
  | 'googly'
  | 'arm-ball';

export type LengthZone =
  | 'yorker'
  | 'full'
  | 'good'
  | 'back-of-length'
  | 'short';

export interface BallDelivery {
  id: string;
  over: number;
  ballNumber: number; // 1-6 (or extras)
  bowlerName: string;
  batterName: string;
  batterStance: BatterStance;
  // Beehive coordinates at stumps plane (in centimeters):
  // x: lateral distance from middle stump (0 = middle stump).
  // For RHB: negative is Off side (left from bowler's view), positive is Leg side (right).
  // For LHB: negative is Leg side, positive is Off side.
  xCm: number;
  // y: vertical height above ground (0 = ground level).
  yCm: number;
  // Associated pitch map coordinates (for full Hawk-Eye sync):
  pitchDistanceMeters?: number; // 0 to 20m from bowling crease (18m-20m is yorker, 14-16 good length, etc.)
  pitchLateralCm?: number;
  speedKph: number;
  outcome: BallOutcome;
  contact: ContactType;
  deliveryType: DeliveryType;
  notes?: string;
  timestamp?: number;
}

export interface ZoneClassification {
  lineZone: 'wide-off' | 'corridor-outside-off' | 'stumps' | 'on-pads' | 'down-leg' | 'wide-leg';
  heightZone: 'toes-yorker' | 'shins' | 'knee-roll-stumps' | 'waist' | 'chest' | 'helmet' | 'over-head';
  isHittingStumps: boolean;
  whichStump?: 'off' | 'middle' | 'leg' | 'bails' | 'misses';
  label: string;
}

// Stumps dimensions in cm
export const CRICKET_SPECS = {
  STUMP_HEIGHT_CM: 71.12, // 28 inches
  STUMP_WIDTH_CM: 22.86,  // 9 inches total wicket width
  STUMP_DIAMETER_CM: 3.5,
  OFF_STUMP_OFFSET_CM: 11.43, // half of 22.86
  LEG_STUMP_OFFSET_CM: 11.43,
  BAIL_HEIGHT_CM: 1.27, // ~0.5 inches
  TOTAL_WICKET_HEIGHT_CM: 72.39,
  OFF_WIDE_LINE_CM: 89.0, // 35 inches from middle stump
  LEG_WIDE_LINE_CM: 30.0, // T20 leg-side wide corridor
  POPPING_CREASE_DEPTH_M: 1.22, // 4 feet
  BATTER_TYPICAL_HEIGHT_CM: 180.0,
  KNEE_ROLL_HEIGHT_CM: 50.0,
  WAIST_HEIGHT_CM: 100.0,
  CHEST_HEIGHT_CM: 135.0,
  HEAD_HEIGHT_CM: 170.0,
};
