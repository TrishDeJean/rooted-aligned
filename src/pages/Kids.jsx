import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import KidCard from "@/components/kids/KidCard";
import AddKidDialog from "@/components/kids/AddKidDialog";

export default function Kids() {
  const [showDialog, setShowDialog] = useState(false);
  const [editKid, setEditKid] = useState(null);
  const queryClient = useQueryClient();
  const user = useCurrentUser();

  const { data: kids = [], isLoading } = useQuery({
    queryKey: ["kids", user?.email],
    queryFn: () => base44.entities.Kid.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const adults = kids.filter(k => k.type === "adult");
  const workKids = kids.filter(k => k.type === "work_kid");
  const homeBoys = kids.filter(k => k.type === "home_boy");
  const nieces = kids.filter(k => k.type === "niece");

  const handleEdit = (kid) => { setEditKid(kid); setShowDialog(true); };
  const handleAdd = () => { setEditKid(null); setShowDialog(true); };

  const handleTogglePresence = async (kid) => {
    await base44.entities.Kid.update(kid.id, { is_present: kid.is_present === false ? true : false });
    queryClient.invalidateQueries({ queryKey: ["kids", user?.email] });
  };

  const KidSection = ({ title, list }) => list.length === 0 ? null : (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">
        {title} ({list.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map(kid => (
          <KidCard key={kid.id} kid={kid} onClick={handleEdit} onTogglePresence={handleTogglePresence} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your People</h2>
          <p className="text-sm text-muted-foreground/70 italic">Your world, at a glance</p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add to your circle
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-24 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : kids.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">No profiles added yet</p>
        </Card>
      ) : (
        <div className="space-y-5">
          <KidSection title="You" list={adults} />
          <KidSection title="Work Kids" list={workKids} />
          <KidSection title="Home" list={homeBoys} />
          {nieces.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nieces ({nieces.length})
                </h3>
                <span className="text-xs text-muted-foreground">· tap Here/Away to toggle</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nieces.map(kid => (
                  <KidCard key={kid.id} kid={kid} onClick={handleEdit} onTogglePresence={handleTogglePresence} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddKidDialog open={showDialog} onOpenChange={setShowDialog} editKid={editKid} />
    </div>
  );
}