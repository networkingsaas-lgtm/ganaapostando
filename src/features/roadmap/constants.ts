export const MAP_PATH_VIEWBOX_WIDTH = 460;
export const MAP_PATH_CENTER_X = 230;
export const MAP_PATH_TOP = 86;
export const MAP_PATH_STEP_Y = 130;
export const MAP_PATH_OFFSETS = [-120, 110, -85, 120, -95, 115];

export const ACCESS_REQUEST_CONCURRENCY = 8;
export const ROADMAP_CACHE_VERSION = 1;
export const ROADMAP_CACHE_TTL_MS = 5 * 60 * 1000;

export interface RoadmapNodePalette {
  side: string;
  sideBorder: string;
  face: string;
  faceBorder: string;
  text: string;
  glow: string;
}

export interface RoadmapLayerTheme {
  titleBackground: string;
  titleSideBackground: string;
  titleBorder: string;
  titleDivider: string;
  titleColor: string;
  titleMuted: string;
  dividerLine: string;
  bubbleBorder: string;
  nodeOpen: RoadmapNodePalette;
  nodeUnlocked: RoadmapNodePalette;
  nodeLocked: RoadmapNodePalette;
  purchase: RoadmapNodePalette;
}

export const ROADMAP_LOCKED_LESSON_BUTTON_PALETTE: RoadmapNodePalette = {
  side: 'hsl(214 9% 50%)',
  sideBorder: 'hsl(214 8% 40%)',
  face: 'linear-gradient(180deg,hsl(214 11% 82%) 0%,hsl(214 9% 72%) 52%,hsl(214 8% 62%) 100%)',
  faceBorder: 'hsl(214 12% 88%)',
  text: 'hsl(214 9% 28%)',
  glow: '0 12px 22px hsla(214 10% 35% / 0.28)',
};

export const ROADMAP_PURCHASE_ENABLED_BUTTON_PALETTE: RoadmapNodePalette = {
  side: '#d49b1f',
  sideBorder: '#c68a16',
  face: 'linear-gradient(180deg,#ffe082 0%,#f7c53f 52%,#e8a71f 100%)',
  faceBorder: '#ffe4ab',
  text: '#472d00',
  glow: '0 14px 26px rgba(255,193,38,0.45)',
};

const interpolate = (from: number, to: number, progress: number) => from + (to - from) * progress;

export const getRoadmapLayerTheme = (layerIndex: number, layersCount: number): RoadmapLayerTheme => {
  const progress = layersCount <= 1 ? 0 : layerIndex / (layersCount - 1);
  const hue = Math.round(interpolate(216, 8, progress));

  return {
    titleBackground: `linear-gradient(180deg,hsl(${hue} 87% 52%) 0%,hsl(${hue} 81% 42%) 100%)`,
    titleSideBackground: `linear-gradient(180deg,hsl(${hue} 82% 44%) 0%,hsl(${hue} 76% 36%) 100%)`,
    titleBorder: `hsla(${hue} 92% 86% / 0.34)`,
    titleDivider: `hsla(${hue} 92% 24% / 0.34)`,
    titleColor: `hsl(${hue} 72% 38%)`,
    titleMuted: `hsl(${hue} 42% 48%)`,
    dividerLine: `repeating-linear-gradient(to right,hsla(${hue} 68% 42% / 0.62) 0 12px,transparent 12px 22px)`,
    bubbleBorder: `hsla(${hue} 48% 60% / 0.46)`,
    nodeOpen: {
      side: `hsl(${hue} 74% 40%)`,
      sideBorder: `hsl(${hue} 66% 30%)`,
      face: `linear-gradient(180deg,hsl(${hue} 95% 84%) 0%,hsl(${hue} 88% 67%) 52%,hsl(${hue} 80% 54%) 100%)`,
      faceBorder: `hsl(${hue} 94% 93%)`,
      text: `hsl(${hue} 76% 17%)`,
      glow: `0 16px 30px hsla(${hue} 90% 48% / 0.46)`,
    },
    nodeUnlocked: {
      side: `hsl(${hue} 68% 42%)`,
      sideBorder: `hsl(${hue} 60% 34%)`,
      face: `linear-gradient(180deg,hsl(${hue} 90% 80%) 0%,hsl(${hue} 84% 62%) 52%,hsl(${hue} 76% 49%) 100%)`,
      faceBorder: `hsl(${hue} 90% 90%)`,
      text: `hsl(${hue} 72% 18%)`,
      glow: `0 14px 26px hsla(${hue} 84% 46% / 0.36)`,
    },
    nodeLocked: ROADMAP_LOCKED_LESSON_BUTTON_PALETTE,
    purchase: {
      side: `hsl(${hue} 72% 42%)`,
      sideBorder: `hsl(${hue} 64% 32%)`,
      face: `linear-gradient(180deg,hsl(${hue} 94% 82%) 0%,hsl(${hue} 86% 63%) 52%,hsl(${hue} 78% 50%) 100%)`,
      faceBorder: `hsl(${hue} 94% 90%)`,
      text: `hsl(${hue} 72% 16%)`,
      glow: `0 14px 26px hsla(${hue} 90% 46% / 0.42)`,
    },
  };
};
