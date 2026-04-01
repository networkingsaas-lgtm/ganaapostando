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
  side: 'hsl(214 12% 48%)',
  sideBorder: 'hsl(214 12% 36%)',
  face: 'hsl(214 14% 56%)',
  faceBorder: 'hsl(214 18% 70%)',
  text: '#ffffff',
  glow: '0 10px 18px hsla(214 18% 28% / 0.28)',
};

export const ROADMAP_PURCHASE_ENABLED_BUTTON_PALETTE: RoadmapNodePalette = {
  side: 'hsl(40 72% 30%)',
  sideBorder: 'hsl(38 68% 22%)',
  face: 'hsl(43 78% 46%)',
  faceBorder: 'hsl(48 92% 68%)',
  text: '#fff7df',
  glow: '0 12px 22px hsla(42 92% 30% / 0.34)',
};

const interpolate = (from: number, to: number, progress: number) => from + (to - from) * progress;

const interpolateAnchoredHue = (progress: number) => {
  const anchors = [
    { t: 0, hue: 206 },   // capa 1 (antes capa 5)
    { t: 0.25, hue: 268 }, // capa 2 (antes capa 4)
    { t: 0.5, hue: 286 }, // capa 3
    { t: 0.75, hue: 322 }, // capa 4 (antes capa 2)
    { t: 1, hue: 346 }, // capa 5 (antes capa 1)
  ];

  if (progress <= anchors[0].t) {
    return anchors[0].hue;
  }

  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1];
    const current = anchors[index];

    if (progress <= current.t) {
      const localProgress = (progress - previous.t) / (current.t - previous.t);
      return Math.round(interpolate(previous.hue, current.hue, localProgress));
    }
  }

  return anchors[anchors.length - 1].hue;
};

export const getRoadmapLayerTheme = (layerIndex: number, layersCount: number): RoadmapLayerTheme => {
  const progress = layersCount <= 1 ? 0 : layerIndex / (layersCount - 1);
  const hue = interpolateAnchoredHue(progress);
  const titleTopLight = Math.round(interpolate(52, 28, progress));
  const titleBottomLight = Math.round(interpolate(38, 18, progress));
  const layerAccentLight = Math.round(interpolate(44, 30, progress));
  const layerAccentSideLight = Math.max(18, layerAccentLight - 8);
  const layerAccentBorderLight = Math.max(14, layerAccentLight - 13);
  const layerAccentFace = `hsl(${hue} 76% ${layerAccentLight}%)`;
  const layerAccentSide = `hsl(${hue} 72% ${layerAccentSideLight}%)`;
  const layerAccentBorder = `hsl(${hue} 68% ${layerAccentBorderLight}%)`;
  const nodeShadowAlpha = interpolate(0.28, 0.42, progress).toFixed(2);

  return {
    titleBackground: `linear-gradient(180deg,hsl(${hue} 92% ${titleTopLight}%) 0%,hsl(${hue} 88% ${titleBottomLight}%) 100%)`,
    titleSideBackground: `linear-gradient(180deg,hsl(${hue} 88% ${Math.max(18, titleTopLight - 10)}%) 0%,hsl(${hue} 84% ${Math.max(14, titleBottomLight - 8)}%) 100%)`,
    titleBorder: `hsla(${hue} 92% 86% / 0.34)`,
    titleDivider: `hsla(${hue} 92% 24% / 0.34)`,
    titleColor: `hsl(${hue} 72% 38%)`,
    titleMuted: `hsl(${hue} 42% 48%)`,
    dividerLine: `repeating-linear-gradient(to right,hsla(${hue} 68% 42% / 0.62) 0 12px,transparent 12px 22px)`,
    bubbleBorder: `hsla(${hue} 48% 60% / 0.46)`,
    nodeOpen: {
      side: layerAccentSide,
      sideBorder: layerAccentBorder,
      face: layerAccentFace,
      faceBorder: `hsl(${hue} 84% ${Math.min(72, layerAccentLight + 18)}%)`,
      text: '#ffffff',
      glow: `0 12px 22px hsla(${hue} 86% 32% / ${nodeShadowAlpha})`,
    },
    nodeUnlocked: {
      side: layerAccentSide,
      sideBorder: layerAccentBorder,
      face: layerAccentFace,
      faceBorder: `hsl(${hue} 84% ${Math.min(72, layerAccentLight + 18)}%)`,
      text: '#ffffff',
      glow: `0 12px 22px hsla(${hue} 84% 30% / ${nodeShadowAlpha})`,
    },
    nodeLocked: ROADMAP_LOCKED_LESSON_BUTTON_PALETTE,
    purchase: {
      side: layerAccentSide,
      sideBorder: layerAccentBorder,
      face: `hsl(${hue} 80% ${Math.min(50, layerAccentLight + 4)}%)`,
      faceBorder: `hsl(${hue} 88% ${Math.min(74, layerAccentLight + 20)}%)`,
      text: '#ffffff',
      glow: `0 12px 22px hsla(${hue} 88% 34% / ${nodeShadowAlpha})`,
    },
  };
};
