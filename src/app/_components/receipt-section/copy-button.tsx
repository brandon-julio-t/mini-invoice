import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { toast } from "sonner";

export const CopyButton: React.ComponentType<{
  textToCopy: string;
}> = ({ textToCopy }) => {
  const [state, setState] = React.useState<"idle" | "copy-success">("idle");

  const timeoutRef = React.useRef<number>(-1);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(textToCopy);
          toast.success("Copied to clipboard");

          setState("copy-success");

          if (timeoutRef.current !== -1) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = window.setTimeout(() => {
            setState("idle");
          }, 2500);
        } catch (error) {
          console.error(error);
          toast.error("Failed to copy to clipboard");
          prompt("Failed to copy, please copy manually", textToCopy);
        }
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "idle" ? (
          <motion.div
            key="idle"
            variants={VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CopyIcon />
          </motion.div>
        ) : (
          <motion.div
            key="copy-success"
            variants={VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CheckIcon className="text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
};

const VARIANTS = {
  initial: {
    opacity: 0,
    scale: 0.25,
    filter: "blur(2px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    scale: 0.25,
    filter: "blur(2px)",
  },
};
