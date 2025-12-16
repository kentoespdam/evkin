import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TooltipProps = {
  text: string;
  children: React.ReactNode;
  className?: string;
  delayDuration?: number;
};

const TooltipBuilder = ({
  text,
  children,
  className,
  delayDuration = 0,
}: TooltipProps) => (
  <TooltipProvider delayDuration={delayDuration}>
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className={cn(
          "text-primary-foreground shadow-lg border border-primary-foreground",
          className,
        )}
      >
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default TooltipBuilder;
