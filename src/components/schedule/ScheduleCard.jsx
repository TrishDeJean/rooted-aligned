import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import KidAvatar from "../kids/KidAvatar";
import { cn } from "@/lib/utils";

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function ScheduleCard({ entry, kids, onToggleComplete, onEdit }) {
  const entryKids = (entry.kids || [])
    .map(kidId => kids.find(k => k.id === kidId))
    .filter(Boolean);

  return (
    <Card
      className={cn(
        "p-4 transition-all border-border/50 hover:shadow-md cursor-pointer group",
        entry.completed && "opacity-60"
      )}
      onClick={() => onEdit?.(entry)}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <Checkbox
            checked={entry.completed}
            onCheckedChange={(checked) => {
              event?.stopPropagation();
              onToggleComplete?.(entry.id, checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "font-semibold text-foreground",
              entry.completed && "line-through text-muted-foreground"
            )}>
              {entry.title}
            </h4>
            <CategoryBadge category={entry.category} showLabel={false} />
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(entry.start_time)}{entry.end_time ? ` – ${formatTime(entry.end_time)}` : ""}
            </span>
            {entry.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {entry.location}
              </span>
            )}
          </div>

          {entryKids.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {entryKids.map(kid => (
                <KidAvatar key={kid.id} name={kid.name} color={kid.avatar_color} size="sm" />
              ))}
            </div>
          )}

          {entry.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{entry.notes}</p>
          )}
        </div>
      </div>
    </Card>
  );
}