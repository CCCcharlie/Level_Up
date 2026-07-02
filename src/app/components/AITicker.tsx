import * as React from "react";
import { Sparkles } from "lucide-react";

interface AILogTickerProps {
  active: boolean;
  entries: string[];
  onComplete?: () => void;
}

export function AILogTicker({ active, entries, onComplete }: AILogTickerProps) {
  const [visibleLogs, setVisibleLogs] = React.useState<string[]>([]);
  const [typingLine, setTypingLine] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    if (!active) {
      setVisibleLogs([]);
      setTypingLine("");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const clearAll = () => {
      while (timers.length > 0) {
        const timer = timers.pop();
        if (typeof timer === "number") {
          window.clearTimeout(timer);
        }
      }
    };

    const typeLine = (lineIndex: number) => {
      const text = entries[lineIndex];
      let charIndex = 0;

      const tick = () => {
        if (cancelled) {
          return;
        }

        charIndex += 1;
        setTypingLine(text.slice(0, charIndex));

        if (charIndex < text.length) {
          timers.push(window.setTimeout(tick, 24));
          return;
        }

        timers.push(
          window.setTimeout(() => {
            if (cancelled) {
              return;
            }

            setVisibleLogs((current) => [...current, text]);
            setTypingLine("");

            if (lineIndex + 1 >= entries.length) {
              timers.push(
                window.setTimeout(() => {
                  if (!cancelled) {
                    onCompleteRef.current?.();
                  }
                }, 700)
              );
              return;
            }

            timers.push(window.setTimeout(() => typeLine(lineIndex + 1), 220));
          }, 260)
        );
      };

      tick();
    };

    setVisibleLogs([]);
    setTypingLine("");
    timers.push(window.setTimeout(() => typeLine(0), 220));

    return () => {
      cancelled = true;
      clearAll();
    };
  }, [active, entries]);

  React.useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [visibleLogs, typingLine]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-auto rounded-2xl border border-cyan-500/15 bg-slate-950/90 p-4 shadow-[0_0_40px_rgba(2,132,199,0.08)]"
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">AI Work Log</p>
          <p className="mt-1 text-sm text-slate-300">NotebookLM 式检索流正在构建上下文。</p>
        </div>
        <Sparkles className="size-4 text-cyan-300/80" />
      </div>

      <div className="space-y-3 font-mono text-[13px]/[1.3] text-slate-300">
        {visibleLogs.map((log, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="mt-0.5 size-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <div className="text-slate-200">{log}</div>
          </div>
        ))}

        {typingLine ? (
          <div className="flex items-start gap-2">
            <div className="mt-0.5 size-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <div className="text-slate-200">{typingLine}</div>
            <div className="ml-0.5 mt-0.5 size-2 rounded-full bg-cyan-300/80 animate-pulse" />
          </div>
        ) : null}
      </div>
    </div>
  );
}