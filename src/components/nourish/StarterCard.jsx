import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
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

  const isDue = starter.next_feed_due && isPast(new Date(starter.next_feed_due));

  return (
    <Card className={`p-4 space-y-3 ${isDue ? "border-accent/60 bg-accent/5" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{starter.name}</h3>
            {isDue && <AlertCircle className="h-4 w-4 text-accent" />}
          </div>
          {starter.last_fed && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Fed {formatDistanceToNow(new Date(starter.last_fed), { addSuffix: true })}
            </p>
          )}
          {starter.next_feed_due && (
            <p className={`text-xs mt-0.5 ${isDue ? "text-accent font-medium" : "text-muted-foreground"}`}>
              {isDue ? "⚠️ Feed due" : `Next feed: ${formatDistanceToNow(new Date(starter.next_feed_due), { addSuffix: true })}`}
            </p>
          )}
          {starter.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">{starter.notes}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(starter)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Button
        size="sm"
        variant={isDue ? "default" : "outline"}
        className="w-full"
        onClick={() => feedMutation.mutate()}
        disabled={feedMutation.isPending}
      >
        🌾 {feedMutation.isPending ? "Feeding..." : "Feed Now"}
      </Button>
    </Card>
  );
}