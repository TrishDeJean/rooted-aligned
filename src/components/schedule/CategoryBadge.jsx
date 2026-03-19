import { Badge } from "@/components/ui/badge";
import {
  Utensils, Moon, Sparkles, GraduationCap, Car, TreePine,
  BookOpen, Gamepad2, Bath, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig = {
  meal: { icon: Utensils, label: "Meal", color: "bg-amber-100 text-amber-700" },
  nap: { icon: Moon, label: "Nap", color: "bg-indigo-100 text-indigo-700" },
  activity: { icon: Sparkles, label: "Activity", color: "bg-pink-100 text-pink-700" },
  school: { icon: GraduationCap, label: "School", color: "bg-sky-100 text-sky-700" },
  pickup_dropoff: { icon: Car, label: "Pickup/Dropoff", color: "bg-violet-100 text-violet-700" },
  outdoor: { icon: TreePine, label: "Outdoor", color: "bg-emerald-100 text-emerald-700" },
  learning: { icon: BookOpen, label: "Learning", color: "bg-blue-100 text-blue-700" },
  free_play: { icon: Gamepad2, label: "Free Play", color: "bg-orange-100 text-orange-700" },
  bath_bedtime: { icon: Bath, label: "Bath/Bedtime", color: "bg-purple-100 text-purple-700" },
  other: { icon: MoreHorizontal, label: "Other", color: "bg-muted text-muted-foreground" },
};

export default function CategoryBadge({ category, showLabel = true }) {
  const config = categoryConfig[category] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn("border-0 gap-1 font-medium", config.color)}>
      <Icon className="h-3 w-3" />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

export { categoryConfig };