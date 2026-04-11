import { LoaderCircle } from 'lucide-react';

interface Props {
  className?: string;
  title?: string;
}

export default function MetodoLoadingScreen({
  className = 'min-h-screen w-full',
  title = 'El M\u00E9todo.',
}: Props) {
  return (
    <div
      className={`flex ${className} flex-col items-center justify-center bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)] text-center text-slate-900`}
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <p className="-translate-y-10 text-5xl font-bold tracking-tight sm:text-7xl">
        <span className="rebel-underline">{title}</span>
      </p>
      <LoaderCircle className="mt-6 h-10 w-10 animate-spin text-slate-500" />
    </div>
  );
}
