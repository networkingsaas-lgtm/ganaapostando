import {
  Calculator,
  CircleAlert,
  CircleDollarSign,
  FileSpreadsheet,
  List,
  LoaderCircle,
  Lock,
  SkipForward,
  Trophy,
  Wrench,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageReveal from '../../../shared/components/PageReveal';
import ScrollReveal from '../../../shared/components/ScrollReveal';
import HeaderTitle from '../../../shared/components/HeaderTitle';
import {
  getRoadmapLayerTheme,
  ROADMAP_PURCHASE_ENABLED_BUTTON_PALETTE,
} from '../constants';
import RoadmapHintBubble from './RoadmapHintBubble';
import type { LayerSection } from '../types';
import { formatPriceEur } from '../utils';

interface Props {
  isLoading: boolean;
  error: string | null;
  layers: LayerSection[];
  isFullscreen?: boolean;
  focusLessonId?: number;
  focusLayerId?: number;
}

type ActiveBubble =
  | { type: 'lesson'; layerId: number; lessonId: number }
  | { type: 'purchase'; layerId: number };

const CURVE_LEFT_X = 14;
const CURVE_RIGHT_X = 86;
const NODE_CURVE_TOP = 72;
const NODE_STEP_Y = 102;
const NODE_SIZE = 88;
const PURCHASE_NODE_SIZE = 84;
const STICKY_TITLE_MAX_WIDTH = 1220;
const NODE_REVEAL_BASE_DELAY_MS = 180;
const NODE_REVEAL_STEP_MS = 210;
const EXCEL_PROMO_NODE_INDEX = 3;
const MONEY_PROMO_GLOBAL_LESSON_NUMBER = 5;
const TOOLS_PROMO_GLOBAL_LESSON_NUMBER = 9;
const VALUE_PROMO_GLOBAL_LESSON_NUMBER = 11;
const PRO_PROMO_GLOBAL_LESSON_NUMBER = 15;

const getLayerHeight = (totalNodes: number) =>
  Math.max(340, NODE_CURVE_TOP + Math.max(totalNodes - 1, 0) * NODE_STEP_Y + 140);

const getLayerCurveRange = (layerIndex: number) =>
  layerIndex % 2 === 0
    ? { startX: CURVE_LEFT_X, endX: CURVE_RIGHT_X }
    : { startX: CURVE_RIGHT_X, endX: CURVE_LEFT_X };

const getNodeLeftPercent = (layerIndex: number, lessonIndex: number, lessonsCount: number) => {
  const { startX, endX } = getLayerCurveRange(layerIndex);

  if (lessonsCount <= 1) {
    return startX;
  }

  const progress = lessonIndex / (lessonsCount - 1);
  const easedProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress);

  return startX + (endX - startX) * easedProgress;
};

const getNodeTop = (nodeIndex: number) => NODE_CURVE_TOP + nodeIndex * NODE_STEP_Y;
const getRevealDelay = (revealIndex: number) =>
  `${NODE_REVEAL_BASE_DELAY_MS + revealIndex * NODE_REVEAL_STEP_MS}ms`;

export default function RoadmapContent({
  isLoading,
  error,
  layers,
  isFullscreen = false,
  focusLessonId,
  focusLayerId,
}: Props) {
  const [activeBubble, setActiveBubble] = useState<ActiveBubble | null>(null);
  const [revealedLayerIds, setRevealedLayerIds] = useState<Record<number, true>>({});
  const [isExcelPromoDismissed, setIsExcelPromoDismissed] = useState(false);
  const [isMoneyPromoDismissed, setIsMoneyPromoDismissed] = useState(false);
  const [isToolsPromoDismissed, setIsToolsPromoDismissed] = useState(false);
  const [isValuePromoDismissed, setIsValuePromoDismissed] = useState(false);
  const [isProPromoDismissed, setIsProPromoDismissed] = useState(false);
  const [flippedLayerId, setFlippedLayerId] = useState<number | null>(null);
  const [bubbleShift, setBubbleShift] = useState(0);
  const [bubbleArrowOffset, setBubbleArrowOffset] = useState(0);
  const hasAutoScrolledToUnlockedLayerRef = useRef(false);
  const contentBoundsRef = useRef<HTMLDivElement | null>(null);
  const activeBubbleRef = useRef<HTMLDivElement | null>(null);
  const layerSectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const layerStartById = useMemo(() => {
    const starts = new Map<number, number>();
    let runningTotal = 0;

    for (const section of layers) {
      starts.set(section.layer.id, runningTotal);
      runningTotal += section.lessons.length;
    }

    return starts;
  }, [layers]);

  const handleCloseBubble = useCallback(() => {
    setActiveBubble(null);
  }, []);

  const handleToggleLessonBubble = useCallback((layerId: number, lessonId: number) => {
    setActiveBubble((currentBubble) => {
      if (
        currentBubble &&
        currentBubble.type === 'lesson' &&
        currentBubble.layerId === layerId &&
        currentBubble.lessonId === lessonId
      ) {
        return null;
      }

      return {
        type: 'lesson',
        layerId,
        lessonId,
      };
    });
  }, []);

  const handleTogglePurchaseBubble = useCallback((layerId: number) => {
    setActiveBubble((currentBubble) => {
      if (currentBubble?.type === 'purchase' && currentBubble.layerId === layerId) {
        return null;
      }

      return {
        type: 'purchase',
        layerId,
      };
    });
  }, []);

  const handleRevealLayer = useCallback((layerId: number) => {
    setRevealedLayerIds((current) => {
      if (current[layerId]) {
        return current;
      }

      return {
        ...current,
        [layerId]: true,
      };
    });
  }, []);

  const measureBubblePosition = useCallback(() => {
    const bubbleElement = activeBubbleRef.current;

    if (!bubbleElement) {
      setBubbleShift(0);
      setBubbleArrowOffset(0);
      return;
    }

    const rect = bubbleElement.getBoundingClientRect();
    const contentBounds = contentBoundsRef.current?.getBoundingClientRect();
    const viewportPadding = 8;
    const leftBoundary = contentBounds ? contentBounds.left + viewportPadding : viewportPadding;
    const rightBoundary = contentBounds
      ? contentBounds.right - viewportPadding
      : window.innerWidth - viewportPadding;
    const leftOverflow = Math.max(0, leftBoundary - rect.left);
    const rightOverflow = Math.max(0, rect.right - rightBoundary);
    const shift = leftOverflow - rightOverflow;
    const maxArrowOffset = Math.max(0, rect.width / 2 - 18);
    const arrowOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, -shift));

    setBubbleShift(shift);
    setBubbleArrowOffset(arrowOffset);
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      measureBubblePosition();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeBubble, measureBubblePosition]);

  useEffect(() => {
    if (!activeBubble) {
      return;
    }

    const handleResize = () => {
      measureBubblePosition();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeBubble, measureBubblePosition]);

  useEffect(() => {
    if (isLoading || error || hasAutoScrolledToUnlockedLayerRef.current || layers.length === 0) {
      return;
    }

    const focusedLayerFromRoute =
      typeof focusLayerId === 'number'
        ? layers.find((section) => section.layer.id === focusLayerId)
        : null;
    const focusedLayerFromLesson =
      typeof focusLessonId === 'number'
        ? layers.find((section) =>
          section.lessons.some((lessonNode) => lessonNode.lesson.id === focusLessonId),
        )
        : null;
    const unlockedLayerWithEntitlement = layers.find((section) =>
      section.lessons.some((lessonNode) => Boolean(lessonNode.access?.entitlement)),
    );
    const fallbackUnlockedLayer = layers.find((section) =>
      section.lessons.some((lessonNode) => lessonNode.isUnlocked),
    );
    const targetLayer =
      focusedLayerFromRoute
      ?? focusedLayerFromLesson
      ?? unlockedLayerWithEntitlement
      ?? fallbackUnlockedLayer;

    const targetElement = targetLayer ? layerSectionRefs.current[targetLayer.layer.id] : null;

    if (!targetElement) {
      return;
    }

    hasAutoScrolledToUnlockedLayerRef.current = true;
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [error, focusLayerId, focusLessonId, isLoading, layers]);

  return (
    <PageReveal
      className={isFullscreen ? 'min-h-screen w-full' : 'min-h-full w-full'}
      instant
    >
      <div
        ref={contentBoundsRef}
        className="w-full bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)] text-slate-900"
        onClick={handleCloseBubble}
      >
        {isLoading && (
          <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)] text-center text-slate-900">
            <p className="-translate-y-10 text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="rebel-underline">{'El M\u00E9todo'}</span>
            </p>
            <LoaderCircle className="mt-6 h-10 w-10 animate-spin text-slate-500" />
            
          </div>
        )}

        {!isLoading && error && (
          <div className="flex min-h-[420px] w-full flex-col items-center justify-center bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)] px-6 text-center">
            <CircleAlert className="h-10 w-10 text-red-500" />
            <p className="mt-4 text-lg font-semibold text-slate-800">{error}</p>
          </div>
        )}

        {!isLoading && !error && layers.length === 0 && (
          <div className="flex min-h-[420px] w-full items-center justify-center bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)] px-6 text-center">
            <p className="text-lg font-semibold text-slate-800">No hay capas publicadas todavia.</p>
          </div>
        )}

        {!isLoading && !error && layers.length > 0 && (
          <div className="w-full bg-transparent">
            {layers.map((section, sectionIndex) => {
              const totalNodes = section.lessons.length + 1;
              const layerHeight = getLayerHeight(totalNodes);
              const purchaseNodeLeftPercent = getNodeLeftPercent(sectionIndex, 0, totalNodes);
              const shouldShowExcelPromoBase =
                sectionIndex === 0 && totalNodes > EXCEL_PROMO_NODE_INDEX;
              const excelPromoLeftPercent = shouldShowExcelPromoBase
                ? getNodeLeftPercent(sectionIndex, EXCEL_PROMO_NODE_INDEX, totalNodes)
                : 0;
              const excelPromoTop = shouldShowExcelPromoBase
                ? getNodeTop(EXCEL_PROMO_NODE_INDEX)
                : 0;
              const layerStart = layerStartById.get(section.layer.id) ?? 0;
              const moneyPromoLessonIndex = MONEY_PROMO_GLOBAL_LESSON_NUMBER - layerStart - 1;
              const shouldShowMoneyPromoBase =
                moneyPromoLessonIndex >= 0 &&
                moneyPromoLessonIndex < section.lessons.length;
              const moneyPromoNodeIndex = shouldShowMoneyPromoBase ? moneyPromoLessonIndex + 1 : -1;
              const moneyPromoLeftPercent = shouldShowMoneyPromoBase
                ? getNodeLeftPercent(sectionIndex, moneyPromoNodeIndex, totalNodes)
                : 0;
              const moneyPromoTop = shouldShowMoneyPromoBase
                ? getNodeTop(moneyPromoNodeIndex)
                : 0;
              const isMoneyPromoOnRight = moneyPromoLeftPercent <= 34;
              const toolsPromoLessonIndex = TOOLS_PROMO_GLOBAL_LESSON_NUMBER - layerStart - 1;
              const shouldShowToolsPromoBase =
                toolsPromoLessonIndex >= 0 &&
                toolsPromoLessonIndex < section.lessons.length;
              const toolsPromoNodeIndex = shouldShowToolsPromoBase ? toolsPromoLessonIndex + 1 : -1;
              const toolsPromoLeftPercent = shouldShowToolsPromoBase
                ? getNodeLeftPercent(sectionIndex, toolsPromoNodeIndex, totalNodes)
                : 0;
              const toolsPromoTop = shouldShowToolsPromoBase
                ? getNodeTop(toolsPromoNodeIndex)
                : 0;
              const isToolsPromoOnRight = toolsPromoLeftPercent <= 34;
              const valuePromoLessonIndex = VALUE_PROMO_GLOBAL_LESSON_NUMBER - layerStart - 1;
              const shouldShowValuePromoBase =
                valuePromoLessonIndex >= 0 &&
                valuePromoLessonIndex < section.lessons.length;
              const valuePromoNodeIndex = shouldShowValuePromoBase ? valuePromoLessonIndex + 1 : -1;
              const valuePromoLeftPercent = shouldShowValuePromoBase
                ? getNodeLeftPercent(sectionIndex, valuePromoNodeIndex, totalNodes)
                : 0;
              const valuePromoTop = shouldShowValuePromoBase
                ? getNodeTop(valuePromoNodeIndex)
                : 0;
              const isValuePromoOnRight = valuePromoLeftPercent <= 34;
              const proPromoLessonIndex = PRO_PROMO_GLOBAL_LESSON_NUMBER - layerStart - 1;
              const shouldShowProPromoBase =
                proPromoLessonIndex >= 0 &&
                proPromoLessonIndex < section.lessons.length;
              const proPromoNodeIndex = shouldShowProPromoBase ? proPromoLessonIndex + 1 : -1;
              const proPromoLeftPercent = shouldShowProPromoBase
                ? getNodeLeftPercent(sectionIndex, proPromoNodeIndex, totalNodes)
                : 0;
              const proPromoTop = shouldShowProPromoBase
                ? getNodeTop(proPromoNodeIndex)
                : 0;
              const isProPromoOnRight = proPromoLeftPercent <= 34;
              const theme = getRoadmapLayerTheme(sectionIndex, layers.length);
              const isLayerRevealed = Boolean(revealedLayerIds[section.layer.id]);
              const hasLayerEntitlement = section.lessons.some((lessonNode) =>
                Boolean(lessonNode.access?.entitlement),
              );
              const isLayerLockedByEntitlement = !hasLayerEntitlement;
              const headerBackground = isLayerLockedByEntitlement
                ? 'linear-gradient(180deg,rgba(248,250,252,0.98) 0%,rgba(237,242,248,0.96) 100%)'
                : 'linear-gradient(180deg,rgba(255,255,255,0.98) 0%,rgba(243,247,255,0.96) 100%)';
              const headerSideBackground = isLayerLockedByEntitlement
                ? 'linear-gradient(180deg,rgba(221,227,236,0.95) 0%,rgba(208,214,224,0.95) 100%)'
                : `linear-gradient(180deg,${theme.nodeUnlocked.face} 0%,${theme.nodeUnlocked.side} 100%)`;
              const headerBorderColor = isLayerLockedByEntitlement
                ? '#d7dee8'
                : '#d4dfef';
              const headerDividerColor = isLayerLockedByEntitlement
                ? '#c8d1dd'
                : theme.nodeUnlocked.faceBorder;
              const headerPrimaryTextClassName = isLayerLockedByEntitlement
                ? 'text-[#1f2937]'
                : 'text-[#0f172a]';
              const headerDescriptionTextClassName = isLayerLockedByEntitlement
                ? 'text-[#334155]'
                : 'text-[#334155]';
              const isHeaderFlipped = flippedLayerId === section.layer.id;
              const layerDescription =
                section.layer.description?.trim() ||
                section.layer.teaser_text?.trim() ||
                'Sin descripcion disponible.';
              const isPurchaseBubbleOpen =
                activeBubble?.type === 'purchase' && activeBubble.layerId === section.layer.id;
              const isSkipDisabledByEntitlement = hasLayerEntitlement;
              const shouldShowExcelPromo = shouldShowExcelPromoBase && !isExcelPromoDismissed;
              const shouldShowMoneyPromo = shouldShowMoneyPromoBase && !isMoneyPromoDismissed;
              const shouldShowToolsPromo = shouldShowToolsPromoBase && !isToolsPromoDismissed;
              const shouldShowValuePromo = shouldShowValuePromoBase && !isValuePromoDismissed;
              const shouldShowProPromo = shouldShowProPromoBase && !isProPromoDismissed;
              const isSkipVisuallyDimmed =
                isSkipDisabledByEntitlement || isPurchaseBubbleOpen;
              const baseSectionZIndex = layers.length - sectionIndex;
              const sectionZIndex =
                activeBubble?.layerId === section.layer.id
                  ? layers.length + 20
                  : baseSectionZIndex;
              const purchasePalette = isSkipVisuallyDimmed
                ? {
                    side: theme.nodeLocked.side,
                    sideBorder: theme.nodeLocked.sideBorder,
                    face: theme.nodeLocked.face,
                    faceBorder: theme.nodeLocked.faceBorder,
                    text: theme.nodeLocked.text,
                    glow: theme.nodeLocked.glow,
                  }
                : {
                    ...ROADMAP_PURCHASE_ENABLED_BUTTON_PALETTE,
                  };

              return (
                <section
                  key={section.layer.id}
                  className="relative w-full overflow-visible bg-transparent px-2 pt-3 sm:px-4"
                  style={{ zIndex: sectionZIndex }}
                  ref={(element) => {
                    layerSectionRefs.current[section.layer.id] = element;
                  }}
                >
                  <div className="mx-auto w-full max-w-[1240px] overflow-visible rounded-[1.8rem] border border-[#d7dce5] bg-white/85 p-2 shadow-[0_14px_32px_rgba(15,23,42,0.10)] backdrop-blur-md sm:p-3 lg:p-4">
                    <ScrollReveal
                      className="relative z-20"
                      delay={Math.min(260, sectionIndex * 60)}
                    >
                      <div className="mx-auto w-full [perspective:1400px]" style={{ maxWidth: `${STICKY_TITLE_MAX_WIDTH}px` }}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setFlippedLayerId((current) => (current === section.layer.id ? null : section.layer.id));
                          }}
                          className="block w-full text-left"
                          aria-label={`Ver descripcion de ${section.layer.title}`}
                        >
                          <span
                            className={`relative block h-[102px] w-full transition-transform duration-500 [transform-style:preserve-3d] sm:h-[112px] lg:h-[120px] ${
                              isHeaderFlipped ? '[transform:rotateX(180deg)]' : ''
                            }`}
                          >
                            <span
                              className="absolute inset-0 grid grid-cols-[1fr_auto] overflow-hidden rounded-[1.35rem] border shadow-[0_16px_36px_rgba(15,23,42,0.20)] [backface-visibility:hidden]"
                              style={{
                                background: headerBackground,
                                borderColor: headerBorderColor,
                              }}
                            >
                              <span className="flex items-center justify-center px-4 py-3 text-center font-bold sm:px-6 sm:py-4 lg:px-7 lg:py-5">
                                <h2
                                  className={`leading-[1.05] text-[1.18rem] tracking-[0.02em] sm:text-[1.5rem] lg:text-[1.75rem] ${headerPrimaryTextClassName}`}
                                >
                                  {sectionIndex + 1}. {section.layer.title}
                                </h2>
                              </span>
                              <span
                                className="flex w-[68px] items-center justify-center border-l sm:w-[80px] lg:w-[90px]"
                                style={{
                                  background: headerSideBackground,
                                  borderColor: headerDividerColor,
                                }}
                              >
                                {isLayerLockedByEntitlement ? (
                                  <Lock className="h-8 w-8 text-[#475569] sm:h-9 sm:w-9" />
                                ) : (
                                  <List className="h-8 w-8 text-white/92 sm:h-9 sm:w-9" />
                                )}
                              </span>
                            </span>
                            <span
                              className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[1.35rem] border px-4 py-3 text-center shadow-[0_16px_36px_rgba(15,23,42,0.20)] [transform:rotateX(180deg)] [backface-visibility:hidden] sm:px-6 sm:py-4 lg:px-7 lg:py-5"
                              style={{
                                background: headerBackground,
                                borderColor: headerBorderColor,
                              }}
                            >
                              <p className={`line-clamp-3 max-w-[92%] text-[0.92rem] font-medium leading-relaxed sm:text-[0.98rem] ${headerDescriptionTextClassName}`}>
                                {layerDescription}
                              </p>
                            </span>
                          </span>
                        </button>
                      </div>
                    </ScrollReveal>

                    <ScrollReveal
                      observeOnly
                      onReveal={() => {
                        handleRevealLayer(section.layer.id);
                      }}
                      className="relative mx-auto w-full max-w-[1220px] px-3 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-10 lg:pt-9"
                    >
                      <div className="relative w-full" style={{ height: `${layerHeight}px` }}>
                      {shouldShowExcelPromo && (
                        <div
                          className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-500 ${
                            isLayerRevealed ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{
                            left: `${excelPromoLeftPercent}%`,
                            top: `${excelPromoTop}px`,
                            transitionDelay: getRevealDelay(3),
                          }}
                        >
                          <RoadmapHintBubble
                            side="left"
                            borderColor="#9cc3ff"
                            contentClassName="flex items-center gap-3 bg-white/96 px-3 py-2 sm:px-4 sm:py-2.5"
                          >
                            <FileSpreadsheet className="h-12 w-12 text-[#166534] sm:h-14 sm:w-14" />
                            <HeaderTitle
                              as="h3"
                              lineHeightClass="leading-[1.05]"
                              className="text-base tracking-[0.06em] sm:text-lg"
                            >
                              Desbloquea los <span className="title-span-highlight">excels</span>
                            </HeaderTitle>
                            
                          </RoadmapHintBubble>
                        </div>
                      )}

                      {shouldShowToolsPromo && (
                        <div
                          className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-500 ${
                            isLayerRevealed ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{
                            left: `${toolsPromoLeftPercent}%`,
                            top: `${toolsPromoTop}px`,
                            transitionDelay: getRevealDelay(Math.max(toolsPromoNodeIndex, 1)),
                          }}
                        >
                          <RoadmapHintBubble
                            side={isToolsPromoOnRight ? 'right' : 'left'}
                            borderColor="#9cc3ff"
                            contentClassName="flex items-center gap-3 bg-white/96 px-3 py-2 sm:px-4 sm:py-2.5"
                          >
                            <Wrench className="h-12 w-12 text-[#166534] sm:h-14 sm:w-14" />
                            <HeaderTitle
                              as="h3"
                              lineHeightClass="leading-[1.05]"
                              className="text-base tracking-[0.06em] sm:text-lg"
                            >
                              Desbloquea nuestras{' '}
                              <span className="title-span-highlight">herramientas</span>
                            </HeaderTitle>
                          </RoadmapHintBubble>
                        </div>
                      )}

                      {shouldShowMoneyPromo && (
                        <div
                          className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-500 ${
                            isLayerRevealed ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{
                            left: `${moneyPromoLeftPercent}%`,
                            top: `${moneyPromoTop}px`,
                            transitionDelay: getRevealDelay(Math.max(moneyPromoNodeIndex, 1)),
                          }}
                        >
                          <RoadmapHintBubble
                            side={isMoneyPromoOnRight ? 'right' : 'left'}
                            borderColor="#9cc3ff"
                            contentClassName="flex items-center gap-3 bg-white/96 px-3 py-2 sm:px-4 sm:py-2.5"
                          >
                            <CircleDollarSign className="h-12 w-12 text-[#166534] sm:h-14 sm:w-14" />
                            <HeaderTitle
                              as="h3"
                              lineHeightClass="leading-[1.05]"
                              className="text-base tracking-[0.06em] sm:text-lg"
                            >
                              Apuesta  <span className="title-span-highlight">conmigo</span> en directo
                            </HeaderTitle>
                          </RoadmapHintBubble>
                        </div>
                      )}

                      {shouldShowValuePromo && (
                        <div
                          className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-500 ${
                            isLayerRevealed ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{
                            left: `${valuePromoLeftPercent}%`,
                            top: `${valuePromoTop}px`,
                            transitionDelay: getRevealDelay(Math.max(valuePromoNodeIndex, 1)),
                          }}
                        >
                          <RoadmapHintBubble
                            side={isValuePromoOnRight ? 'right' : 'left'}
                            borderColor="#9cc3ff"
                            contentClassName="max-w-[360px] flex items-center gap-3 bg-white/96 px-3 py-2 sm:px-4 sm:py-2.5"
                          >
                            <Calculator className="h-12 w-12 text-[#166534] sm:h-14 sm:w-14" />
                            <HeaderTitle
                              as="h3"
                              lineHeightClass="leading-[1.08]"
                              className="text-sm tracking-[0.04em] sm:text-base"
                            >
                              Grupo de<span className="title-span-highlight">apuestas</span> de valor
                            </HeaderTitle>
                          </RoadmapHintBubble>
                        </div>
                      )}

                      {shouldShowProPromo && (
                        <div
                          className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-500 ${
                            isLayerRevealed ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{
                            left: `${proPromoLeftPercent}%`,
                            top: `${proPromoTop}px`,
                            transitionDelay: getRevealDelay(Math.max(proPromoNodeIndex, 1)),
                          }}
                        >
                          <RoadmapHintBubble
                            side={isProPromoOnRight ? 'right' : 'left'}
                            borderColor="#9cc3ff"
                            contentClassName="max-w-[440px] flex items-center gap-3 bg-white/96 px-3 py-2 sm:px-4 sm:py-2.5"
                          >
                            <Trophy className="h-12 w-12 text-[#166534] sm:h-14 sm:w-14" />
                            <HeaderTitle
                              as="h3"
                              lineHeightClass="leading-[1.08]"
                              className="text-sm tracking-[0.04em] sm:text-base"
                            >
                              Pro en ligas <span className="title-span-highlight">mayores</span>
                            </HeaderTitle>
                          </RoadmapHintBubble>
                        </div>
                      )}

                      <div
                        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${
                          isPurchaseBubbleOpen ? 'z-50' : 'z-30'
                        } ${isLayerRevealed ? '' : 'pointer-events-none'}`}
                        style={{
                          left: `${purchaseNodeLeftPercent}%`,
                          top: `${getNodeTop(0)}px`,
                          opacity: isLayerRevealed ? 1 : 0,
                          transitionDelay: getRevealDelay(0),
                        }}
                      >
                        <button
                          type="button"
                          onClick={(event) => {
                            if (isSkipDisabledByEntitlement) {
                              return;
                            }
                            event.stopPropagation();
                            handleTogglePurchaseBubble(section.layer.id);
                          }}
                          disabled={isSkipDisabledByEntitlement}
                          className={`group relative overflow-visible transition-transform duration-500 ${
                            isSkipDisabledByEntitlement
                              ? 'cursor-not-allowed'
                              : 'hover:scale-105 active:translate-y-[2px]'
                          } ${
                            isLayerRevealed ? 'scale-100' : 'scale-75'
                          }`}
                          style={{ width: `${PURCHASE_NODE_SIZE}px`, height: `${PURCHASE_NODE_SIZE}px` }}
                          aria-label={
                            isSkipDisabledByEntitlement
                              ? `Seccion ${section.layer.title} ya desbloqueada`
                              : `Comprar capa ${section.layer.title}`
                          }
                        >
                          <span
                            className="relative z-10 flex h-full w-full items-center justify-center rounded-full border-[3px]"
                            style={{
                              borderColor: purchasePalette.faceBorder,
                              background: purchasePalette.face,
                              color: purchasePalette.text,
                              boxShadow: `0 10px 20px rgba(15,23,42,0.22), ${purchasePalette.glow}`,
                            }}
                          >
                            <SkipForward className="relative h-7 w-7 drop-shadow-[0_2px_2px_rgba(2,8,35,0.35)]" />
                          </span>
                        </button>

                        {!isSkipDisabledByEntitlement && isPurchaseBubbleOpen && (
                          <div
                            ref={activeBubbleRef}
                            className="absolute left-1/2 top-[calc(100%+12px)] z-50 w-[280px] max-w-[calc(100vw-16px)] rounded-[1.4rem] border bg-white p-4 text-left shadow-[0_12px_26px_rgba(15,23,42,0.14)] sm:w-[320px] sm:p-5"
                            style={{
                              borderColor: theme.bubbleBorder,
                              transform: `translateX(calc(-50% + ${bubbleShift}px))`,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            <span
                              className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t bg-white"
                              style={{
                                borderColor: theme.bubbleBorder,
                                left: `calc(50% + ${bubbleArrowOffset}px)`,
                              }}
                            />
                            <div className="relative flex min-h-[18.5rem] w-full flex-col rounded-[1.1rem] border-2 border-[#d5dbe6] bg-white p-4 sm:min-h-[19.5rem] sm:p-5">
                              <span className="absolute left-3 top-3 rounded-lg bg-gray-900 px-2 py-1 text-xs font-black text-white">
                                {section.layer.position}
                              </span>
                              <h3 className="mt-8 line-clamp-4 text-2xl font-bold text-gray-900">
                                <span className="rebel-underline">El Metodo.</span>{' '}
                                {section.layer.title}
                              </h3>
                              <p className="mt-5 whitespace-nowrap text-4xl font-bold leading-none text-gray-900">
                                {formatPriceEur(section.layer.price_eur)}
                              </p>
                              <p className="mt-3 text-sm font-semibold text-gray-600">Disponible</p>
                              <button
                                type="button"
                                className="mt-auto w-full rounded-xl bg-[#3b82f6] py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
                              >
                                Comprar capa
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {section.lessons.map((lessonNode, lessonIndex) => {
                        const lessonNodeIndex = lessonIndex + 1;
                        const revealIndex = lessonNodeIndex;
                        const globalLessonNumber = layerStart + lessonIndex + 1;
                        const isBubbleOpen =
                          activeBubble?.type === 'lesson' &&
                          activeBubble?.layerId === section.layer.id &&
                          activeBubble.lessonId === lessonNode.lesson.id;
                        const nodePalette = isLayerLockedByEntitlement
                          ? {
                              side: theme.nodeLocked.side,
                              sideBorder: theme.nodeLocked.sideBorder,
                              face: theme.nodeLocked.face,
                              faceBorder: theme.nodeLocked.faceBorder,
                              text: theme.nodeLocked.text,
                              glow: theme.nodeLocked.glow,
                            }
                          : isBubbleOpen
                            ? {
                                side: theme.nodeOpen.side,
                                sideBorder: theme.nodeOpen.sideBorder,
                                face: theme.nodeOpen.face,
                                faceBorder: theme.nodeOpen.faceBorder,
                                text: theme.nodeOpen.text,
                                glow: theme.nodeOpen.glow,
                              }
                            : lessonNode.isUnlocked
                              ? {
                                  side: theme.nodeUnlocked.side,
                                  sideBorder: theme.nodeUnlocked.sideBorder,
                                  face: theme.nodeUnlocked.face,
                                  faceBorder: theme.nodeUnlocked.faceBorder,
                                  text: theme.nodeUnlocked.text,
                                  glow: theme.nodeUnlocked.glow,
                                }
                              : {
                                  side: theme.nodeLocked.side,
                                  sideBorder: theme.nodeLocked.sideBorder,
                                  face: theme.nodeLocked.face,
                                  faceBorder: theme.nodeLocked.faceBorder,
                                  text: theme.nodeLocked.text,
                                  glow: theme.nodeLocked.glow,
                                };

                        return (
                          <div
                            key={lessonNode.lesson.id}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${
                              isBubbleOpen ? 'z-50' : 'z-10'
                            } ${isLayerRevealed ? '' : 'pointer-events-none'}`}
                            style={{
                              left: `${getNodeLeftPercent(
                                sectionIndex,
                                lessonNodeIndex,
                                totalNodes,
                              )}%`,
                              top: `${getNodeTop(lessonNodeIndex)}px`,
                              opacity: isLayerRevealed ? 1 : 0,
                              transitionDelay: getRevealDelay(revealIndex),
                            }}
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                if (
                                  sectionIndex === 0 &&
                                  lessonIndex === EXCEL_PROMO_NODE_INDEX - 1
                                ) {
                                  setIsExcelPromoDismissed(true);
                                }
                                if (globalLessonNumber === TOOLS_PROMO_GLOBAL_LESSON_NUMBER) {
                                  setIsToolsPromoDismissed(true);
                                }
                                if (globalLessonNumber === MONEY_PROMO_GLOBAL_LESSON_NUMBER) {
                                  setIsMoneyPromoDismissed(true);
                                }
                                if (globalLessonNumber === VALUE_PROMO_GLOBAL_LESSON_NUMBER) {
                                  setIsValuePromoDismissed(true);
                                }
                                if (globalLessonNumber === PRO_PROMO_GLOBAL_LESSON_NUMBER) {
                                  setIsProPromoDismissed(true);
                                }
                                handleToggleLessonBubble(section.layer.id, lessonNode.lesson.id);
                              }}
                              className={`group relative overflow-visible transition-transform duration-500 hover:scale-105 active:translate-y-[2px] ${
                                isLayerRevealed ? 'scale-100' : 'scale-75'
                              }`}
                              style={{ width: `${NODE_SIZE}px`, height: `${NODE_SIZE}px` }}
                              aria-label={`Abrir leccion ${lessonNode.lesson.title}`}
                            >
                              <span
                                className="relative z-10 flex h-full w-full items-center justify-center rounded-full border-[3px]"
                                style={{
                                  borderColor: nodePalette.faceBorder,
                                  background: nodePalette.face,
                                  color: nodePalette.text,
                                  boxShadow: `0 10px 20px rgba(15,23,42,0.20), ${nodePalette.glow}`,
                                }}
                              >
                                <span className="relative text-xl font-black drop-shadow-[0_2px_2px_rgba(2,8,35,0.45)]">
                                  {globalLessonNumber}
                                </span>
                              </span>
                            </button>

                            {isBubbleOpen && (
                              <div
                                ref={activeBubbleRef}
                                className="absolute left-1/2 top-[calc(100%+12px)] z-50 w-[320px] max-w-[calc(100vw-16px)] rounded-[1.4rem] border bg-white p-5 text-left shadow-[0_12px_26px_rgba(15,23,42,0.14)] sm:w-[420px] sm:p-6 lg:w-[580px] lg:p-7 xl:w-[700px]"
                                style={{ borderColor: theme.bubbleBorder, transform: `translateX(calc(-50% + ${bubbleShift}px))` }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                }}
                              >
                                <span
                                  className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t bg-white"
                                  style={{ borderColor: theme.bubbleBorder, left: `calc(50% + ${bubbleArrowOffset}px)` }}
                                />
                                <p className="text-base font-black sm:text-xl lg:text-2xl" style={{ color: theme.titleColor }}>
                                  {lessonNode.lesson.title}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
                                  {lessonNode.lesson.summary?.trim() || 'Sin descripcion.'}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    </ScrollReveal>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageReveal>
  );
}

