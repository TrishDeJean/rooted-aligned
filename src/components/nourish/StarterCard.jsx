import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Clock } from "lucide-react";
import { formatDistanceToNow, isPast, format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHours } from "date-fns";

export default function StarterCard({ starter, onEdit }) {
  const queryClient = useQueryClient();

  const feedMutation = useMutation({
    mutationFn: () => base44.entities.Starter.update(starter.id, {
      last_fed: new Date().toISOString(),
      next_feed_due: addHours(new Date(), 12).toISOString(),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["starters"] }),
  });

  const locationMutation = useMutation({
    mutationFn: (location) => base44.entities.Starter.update(starter.id, { location }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["starters"] }),
  });

  const isDue = starter.next_feed_due && isPast(new Date(starter.next_feed_due));
  const isInFridge = starter.location === "in_fridge";

  const statusConfig = isInFridge
    ? { label: "In the fridge", color: "bg-muted/60 text-muted-foreground border-border", dot: "bg-muted-foreground/40" }
    : isDue
    ? { label: "Needs feeding", color: "bg-accent/15 text-accent border-accent/30", dot: "bg-accent animate-pulse" }
    : { label: "On the counter", color: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" };

  return (
    <Card className={`p-4 space-y-3 ${isDue && !isInFridge ? "border-accent/40 bg-accent/5" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{starter.name}</h3>
            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusConfig.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>
          {starter.last_fed && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last fed: {format(new Date(starter.last_fed), "h:mm a")}
              <span className="text-muted-foreground/50">· {formatDistanceToNow(new Date(starter.last_fed), { addSuffix: true })}</span>
            </p>
          )}
          {starter.next_feed_due && !isInFridge && (
            <p className={`text-xs mt-0.5 ${isDue ? "text-accent font-medium" : "text-muted-foreground"}`}>
              {isDue ? "⚠️ Ready to tend" : `Next care: ${formatDistanceToNow(new Date(starter.next_feed_due), { addSuffix: true })}`}
            </p>
          )}
          {starter.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">{starter.notes}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onEdit(starter)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => locationMutation.mutate(isInFridge ? "on_counter" : "in_fridge")}
          disabled={locationMutation.isPending}
          className={`flex-1 text-xs py-1.5 rounded-xl border transition-all font-medium ${
            isInFridge
              ? "bg-muted/60 text-muted-foreground border-border"
              : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          {isInFridge ? "💤 In the fridge" : "🌡️ On the counter"}
        </button>
        {!isInFridge && (
          <Button
            size="sm"
            variant={isDue ? "default" : "outline"}
            onClick={() => feedMutation.mutate()}
            disabled={feedMutation.isPending}
          >
            🌾 {feedMutation.isPending ? "Tending..." : "Tend now"}
          </Button>
        )}
      </div>
    </Card>
  );
}