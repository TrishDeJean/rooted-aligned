import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KidAvatar from "./KidAvatar";
import { cn } from "@/lib/utils";
import { formatAge } from "@/utils/formatAge";

const typeLabel = { work_kid: "Work", home_boy: "Home", niece: "Niece", adult: "Adult" };

export default function KidCard({ kid, onClick, onTogglePresence }) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-all border-border/50 hover:border-primary/20",
        kid.is_present === false && "opacity-50"
      )}
      onClick={() => onClick?.(kid)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <KidAvatar name={kid.name} color={kid.avatar_color} size="lg" />
          <div className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
            kid.is_present !== false ? "bg-primary" : "bg-muted-foreground/25"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{kid.name}</h3>
          {(kid.birthday || kid.age) && (
            <p className="text-sm text-muted-foreground">
              {formatAge(kid.birthday) || `${kid.age} years old`}
            </p>
          )}
          <Badge
            variant="secondary"
            className="bg-secondary text-secondary-foreground border-0 mt-1"
          >
            {typeLabel[kid.type] || kid.type}
          </Badge>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onTogglePresence?.(kid); }}
          className={cn(
            "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
            kid.is_present !== false
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {kid.is_present !== false ? "Here with me" : "Not here"}
        </button>
      </div>
      {kid.notes && (
        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{kid.notes}</p>
      )}
    </Card>
  );
}