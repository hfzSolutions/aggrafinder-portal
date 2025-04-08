
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("container px-4 md:px-8 mx-auto", className)}
      {...props}
    />
  );
}
