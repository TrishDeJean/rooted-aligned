import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Cake, Pencil, Trash2, AlertTriangle, LogOut, Wind, Heart, Sparkles, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import KidAvatar from "@/components/kids/KidAvatar";
import AddKidDialog from "@/components/kids/AddKidDialog";
import { formatAge } from "@/utils/formatAge";
import { Link } from "react-router-dom";

export default function Profile() {
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const queryClient = useQueryClient();

  const { data: people = [], isLoading } = useQuery({
    queryKey: ["kids"],
    queryFn: () => base44.entities.Kid.list(),
  });

  const { data: lastCheckIn } = useQuery({
    queryKey: ["lastCheckIn"],
    queryFn: () => base44.entities.CheckInLog.list("-checked_at", 1),
    select: (data) => data?.[0] ?? null,
  });

  const me = people.find(p => p.type === "adult");

  const handleLogout = () => base44.auth.logout();

  const handleDeleteAccount = async () => {
    if (deleteStep === 1) { setDeleteStep(2); return; }
    // Step 2: final confirmation — log out and inform user
    await base44.auth.logout();
  };

  const age = me ? formatAge(me.birthday) || (me.age ? `${me.age} years old` : null) : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">You</h2>
        <p className="text-sm text-muted-foreground/60 italic">{["Come back to yourself.", "A moment just for you.", "Breathe, you're here."][new Date().getDay() % 3]}</p>
      </div>

      {isLoading ? (
        <Card className="h-32 animate-pulse bg-muted/50" />
      ) : !me ? (
        <Card className="p-8 text-center border-dashed space-y-3">
          <User className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No adult profile found</p>
          <Button size="sm" onClick={() => setShowEdit(true)}>Create My Profile</Button>
        </Card>
      ) : (
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <KidAvatar name={me.name} color={me.avatar_color || "peach"} size="xl" />
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground">{me.name}</h3>
              {age && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Cake className="h-3.5 w-3.5" />
                  <span>{age}</span>
                </div>
              )}
              {me.birthday && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  🎂 {new Date(me.birthday + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              {me.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{me.notes}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowEdit(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* How are you feeling */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">How are you feeling today?</p>
        {lastCheckIn?.mood ? (
          <p className="text-xs text-muted-foreground/70">Today feels: <span className="text-primary font-medium">{lastCheckIn.mood}</span></p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic">No check-in yet</p>
        )}
      </div>

      {/* Gentle moments */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">A moment for you</h3>
        <Card className="divide-y divide-border/50">
          <Link to="/TakeAMoment" className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors rounded-t-xl">
            <Wind className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Take a moment</span>
          </Link>
          <Link to="/CheckIn" className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Check in with yourself</span>
          </Link>
          <Link to="/ResetYourSpace" className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors rounded-b-xl">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Reset your space</span>
          </Link>
        </Card>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">Settings</h3>
        <Card className="divide-y divide-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors rounded-t-xl"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-sm font-medium block">Step Away</span>
              <span className="text-xs text-muted-foreground/60">Logout</span>
            </div>
          </button>
          <button
            onClick={() => { setShowDeleteConfirm(true); setDeleteStep(1); }}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-destructive/5 transition-colors rounded-b-xl"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <div>
              <span className="text-sm font-medium text-destructive block">Start Fresh</span>
              <span className="text-xs text-muted-foreground/60">Delete Account</span>
            </div>
          </button>
        </Card>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="p-5 border-destructive/30 bg-destructive/5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                {deleteStep === 1 ? "Delete your account?" : "This cannot be undone"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {deleteStep === 1
                  ? "All your data including schedules, kids, and settings will be permanently deleted."
                  : "Tap confirm to permanently delete your account and all associated data. You will be signed out immediately."}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              {deleteStep === 1 ? "Continue" : "Yes, Delete Everything"}
            </Button>
          </div>
        </Card>
      )}

      <AddKidDialog
        open={showEdit}
        onOpenChange={(v) => { setShowEdit(v); if (!v) queryClient.invalidateQueries({ queryKey: ["kids"] }); }}
        editKid={me}
        defaultType="adult"
      />
    </div>
  );
}