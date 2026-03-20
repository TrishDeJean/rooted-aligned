import { cn } from "@/lib/utils";

const colorMap = {
  purple: "bg-primary/20 text-primary-foreground",
  peach: "bg-accent/40 text-accent-foreground",
  teal: "bg-accent text-accent-foreground",
  pink: "bg-secondary text-secondary-foreground",
  amber: "bg-accent/60 text-foreground",
  sky: "bg-primary/10 text-primary-foreground",
  lime: "bg-muted text-muted-foreground",
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