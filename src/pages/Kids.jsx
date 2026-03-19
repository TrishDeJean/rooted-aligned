import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import KidCard from "@/components/kids/KidCard";
import AddKidDialog from "@/components/kids/AddKidDialog";

export default function Kids() {
  const [showDialog, setShowDialog] = useState(false);
  const [editKid, setEditKid] = useState(null);

  const { data: kids = [], isLoading } = useQuery({
    queryKey: ["kids"],
    queryFn: () => base44.entities.Kid.list(),
  });

  const workKids = kids.filter(k => k.type === "work_kid");
  const homeBoys = kids.filter(k => k.type === "home_boy");

  const handleEdit = (kid) => {
    setEditKid(kid);
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditKid(null);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Kids</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Kid
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
          <p className="text-muted-foreground font-medium">No kids added yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your work kids and home boys to get started</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {workKids.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Work ({workKids.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workKids.map(kid => (
                  <KidCard key={kid.id} kid={kid} onClick={handleEdit} />
                ))}
              </div>
            </div>
          )}
          {homeBoys.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Home ({homeBoys.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {homeBoys.map(kid => (
                  <KidCard key={kid.id} kid={kid} onClick={handleEdit} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddKidDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editKid={editKid}
      />
    </div>
  );
}