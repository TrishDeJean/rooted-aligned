import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KidAvatar from "./KidAvatar";

export default function KidCard({ kid, onClick }) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-all border-border/50 hover:border-primary/20"
      onClick={() => onClick?.(kid)}
    >
      <div className="flex items-center gap-3">
        <KidAvatar name={kid.name} color={kid.avatar_color} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{kid.name}</h3>
          {kid.age && (
            <p className="text-sm text-muted-foreground">{kid.age} years old</p>
          )}
          <Badge
            variant="secondary"
            className={kid.type === "work_kid"
              ? "bg-primary/10 text-primary border-0 mt-1"
              : "bg-secondary text-secondary-foreground border-0 mt-1"
            }
          >
            {kid.type === "work_kid" ? "Work Kid" : "Home Boy"}
          </Badge>
        </div>
      </div>
      {kid.notes && (
        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{kid.notes}</p>
      )}
    </Card>
  );
}