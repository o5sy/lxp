import { Fragment } from "react";

import { cn } from "@/shared/lib/utils";

type StepRailProps = {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
};

export function StepRail({ currentStep, totalSteps, stepLabel }: StepRailProps) {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-foreground tracking-wide uppercase">
          # step {currentStep} of {totalSteps} — {stepLabel}
        </span>
        <span className="text-primary font-semibold">{percent}%</span>
      </div>
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const done = step < currentStep;
          const current = step === currentStep;

          return (
            <Fragment key={step}>
              {step > 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    step <= currentStep ? "bg-primary" : "bg-line",
                  )}
                />
              )}
              <div
                className={cn(
                  "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold",
                  (done || current) && "bg-primary border-primary text-primary-foreground",
                  current && "ring-primary/25 ring-3",
                  !done && !current && "border-line text-faint",
                )}
              >
                {done ? "✓" : step}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
