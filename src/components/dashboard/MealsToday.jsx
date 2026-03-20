import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function MealsToday() {
  const todayDate = new Date();
  const weekStart = startOfWeek(todayDate, { weekStartsOn: 0 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const dayKey = DAY_KEYS[todayDate.getDay()];

  const { data: plan } = useQuery({
    queryKey: ["mealPlanToday"],
    queryFn: async () => {
      const results = await base44.entities.MealPlan.filter({ week_start: weekStartStr });
      return results[0] ?? null;
    },
  });

  const breakfast = plan?.[`${dayKey}_breakfast`];
  const lunch = plan?.[`${dayKey}_lunch`];
  const dinner = plan?.[`${dayKey}_dinner`];
  const snacks = plan?.[`${dayKey}_snacks`];

  const hasMeals = breakfast || lunch || dinner || snacks;

  if (!hasMeals) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Utensils className="h-4 w-4 text-accent" />
          Meals today 🍽️
        </h3>
        <Link to="/KitchenPlan" className="text-xs text-muted-foreground/60 hover:text-primary transition-colors">
          Edit plan →
        </Link>
      </div>
      <Card className="p-4 space-y-2.5 bg-accent/5 border-accent/20">
        {breakfast && (
          <MealRow emoji="🌤" label="Breakfast" value={breakfast} />
        )}
        {lunch && (
          <MealRow emoji="🌿" label="Lunch" value={lunch} />
        )}
        {dinner && (
          <MealRow emoji="🌙" label="Dinner" value={dinner} />
        )}
        {snacks && (
          <MealRow emoji="🍎" label="Snacks" value={snacks} />
        )}
      </Card>
    </div>
  );
}

function MealRow({ emoji, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-base leading-tight">{emoji}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground leading-snug">{value}</p>
      </div>
    </div>
  );
}