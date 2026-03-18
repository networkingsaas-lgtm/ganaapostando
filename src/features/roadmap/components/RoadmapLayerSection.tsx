import { List } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import {
  MAP_PATH_CENTER_X,
  MAP_PATH_OFFSETS,
  MAP_PATH_TOP,
  MAP_PATH_VIEWBOX_WIDTH,
} from '../constants';
import type { LayerSection, MapPoint } from '../types';
import { buildSPath, buildSPathPoints, formatPriceEur, getNodeIcon } from '../utils';

interface Props {
  section: LayerSection;
  sectionIndex: number;
  selectedLessonId: number | undefined;
  onSelectLesson: (layerId: number, lessonId: number) => void;
  onOpenLayerInfo: (layerId: number) => void;
  onJumpToPricing: () => void;
}

function RoadmapLayerSection({
  section,
  sectionIndex,
  selectedLessonId,
  onSelectLesson,
  onOpenLayerInfo,
  onJumpToPricing,
}: Props) {
  const points = useMemo(() => buildSPathPoints(section.lessons), [section.lessons]);
  const purchasePoint = useMemo<MapPoint>(
    () => ({
      x: MAP_PATH_CENTER_X + MAP_PATH_OFFSETS[MAP_PATH_OFFSETS.length - 1],
      y: Math.max(14, MAP_PATH_TOP - 72),
    }),
    [],
  );
  const pathPoints = useMemo(() => [purchasePoint, ...points], [points, purchasePoint]);
  const pathDefinition = useMemo(() => buildSPath(pathPoints), [pathPoints]);
  const pathHeight = useMemo(
    () => Math.max(360, (pathPoints[pathPoints.length - 1]?.y ?? MAP_PATH_TOP) + 120),
    [pathPoints],
  );
  const selectedLesson = useMemo(
    () =>
      section.lessons.find((lessonNode) => lessonNode.lesson.id === selectedLessonId) ??
      section.lessons.find((lessonNode) => lessonNode.isCurrent) ??
      section.lessons[0],
    [section.lessons, selectedLessonId],
  );

  const handleOpenInfo = useCallback(() => {
    onOpenLayerInfo(section.layer.id);
  }, [onOpenLayerInfo, section.layer.id]);

  const handleSelectLesson = useCallback(
    (lessonId: number) => {
      onSelectLesson(section.layer.id, lessonId);
    },
    [onSelectLesson, section.layer.id],
  );

  return (
    <section className="relative">
      {sectionIndex > 0 && (
        <div className="mb-5 mt-8 border-t border-dashed border-white/28" />
      )}

      <div className="sticky top-2 z-20 mb-3 flex items-center justify-between rounded-2xl border border-white/14 bg-[#0e2537]/88 px-4 py-2 backdrop-blur-md">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/68">
            Capa {sectionIndex + 1}
          </p>
          <p className="truncate text-base font-black text-white">{section.layer.title}</p>
        </div>
        <button
          type="button"
          onClick={handleOpenInfo}
          className="rounded-xl border border-white/24 bg-white/14 p-2.5 transition hover:bg-white/22"
          aria-label={`Ver informacion de ${section.layer.title}`}
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mx-auto w-full max-w-[560px]" style={{ height: `${pathHeight}px` }}>
        {pathDefinition && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${MAP_PATH_VIEWBOX_WIDTH} ${pathHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={pathDefinition}
              fill="none"
              stroke="rgba(72,95,117,0.85)"
              strokeLinecap="round"
              strokeWidth="18"
            />
            <path
              d={pathDefinition}
              fill="none"
              stroke="rgba(128,157,184,0.5)"
              strokeDasharray="10 18"
              strokeLinecap="round"
              strokeWidth="6"
            />
          </svg>
        )}

        {section.lessons.map((lessonNode, lessonIndex) => {
          const nodePoint = points[lessonIndex];
          const isSelected = selectedLesson?.lesson.id === lessonNode.lesson.id;
          const NodeIcon = getNodeIcon(lessonNode, lessonIndex);
          const nodeIconStyle = lessonNode.isUnlocked ? 'text-white' : 'text-slate-400';
          const nodeBaseStyle = lessonNode.isUnlocked
            ? 'border-lime-300/70 bg-[linear-gradient(180deg,#67cf35,#49a51f)] shadow-[0_20px_35px_rgba(79,169,32,0.42)]'
            : 'border-slate-500/35 bg-[linear-gradient(180deg,#3b4f61,#2a3d4d)] shadow-[0_18px_32px_rgba(3,10,19,0.45)]';
          const nodeSelectedStyle = isSelected
            ? 'ring-4 ring-cyan-200/70 ring-offset-2 ring-offset-[#071724]'
            : '';

          return (
            <button
              key={lessonNode.lesson.id}
              type="button"
              onClick={() => handleSelectLesson(lessonNode.lesson.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 transition duration-200 hover:scale-105 ${nodeBaseStyle} ${nodeSelectedStyle} ${
                lessonNode.isCurrent ? 'map-current-node' : ''
              }`}
              style={{
                left: `${(nodePoint.x / MAP_PATH_VIEWBOX_WIDTH) * 100}%`,
                top: `${nodePoint.y}px`,
                width: '84px',
                height: '84px',
              }}
              aria-label={`Abrir leccion ${lessonNode.lesson.title}`}
            >
              <span className={`flex h-full w-full items-center justify-center ${nodeIconStyle}`}>
                <NodeIcon className="h-8 w-8" />
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onJumpToPricing}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-300/80 bg-[linear-gradient(180deg,#ffd978,#f59e0b)] text-[#2b1700] shadow-[0_20px_34px_rgba(245,158,11,0.45)] transition duration-200 hover:scale-105"
          style={{
            left: `${(purchasePoint.x / MAP_PATH_VIEWBOX_WIDTH) * 100}%`,
            top: `${purchasePoint.y}px`,
            width: '104px',
            height: '104px',
          }}
          aria-label={`Comprar ${section.layer.title} por ${formatPriceEur(section.layer.price_eur)}`}
        >
          <span className="flex h-full w-full flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.12em]">Comprar capa</span>
            <span className="mt-1 text-xs font-black">{formatPriceEur(section.layer.price_eur)}</span>
          </span>
        </button>
      </div>
    </section>
  );
}

export default memo(RoadmapLayerSection);
