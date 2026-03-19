import { cn } from "@/lib/utils";

const colorMap = {
  purple: "bg-primary/15 text-primary",
  peach: "bg-secondary text-secondary-foreground",
  teal: "bg-accent text-accent-foreground",
  pink: "bg-pink-100 text-pink-700",
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  lime: "bg-lime-100 text-lime-700",
};

export default function KidAvatar({ name, color, size = "md", className }) {
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };

  return (
    <div className={cn(
      "rounded-2xl font-bold flex items-center justify-center flex-shrink-0",
      sizeClasses[size],
      colorMap[color] || "bg-muted text-muted-foreground",
      className
    )}>
      {initials}
    </div>
  );
}