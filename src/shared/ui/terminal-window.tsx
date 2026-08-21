import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type TerminalWindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function TerminalWindow({ title, children, className, bodyClassName }: TerminalWindowProps) {
  return (
    <section
      className={cn(
        "border-line bg-card flex flex-col overflow-hidden rounded-md border",
        className,
      )}
    >
      <header className="border-line bg-titlebar flex items-center gap-2 border-b px-3 py-1.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="bg-destructive/70 h-2.5 w-2.5 rounded-full" />
          <span className="bg-warning/70 h-2.5 w-2.5 rounded-full" />
          <span className="bg-success/70 h-2.5 w-2.5 rounded-full" />
        </div>
        <p className="text-muted-foreground font-mono text-xs">{title}</p>
      </header>
      <div className={cn("flex flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  );
}
