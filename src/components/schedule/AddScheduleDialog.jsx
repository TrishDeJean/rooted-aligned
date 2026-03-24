import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { categoryConfig } from "./CategoryBadge";
import KidAvatar from "../kids/KidAvatar";

const emptyForm = {
  title: "",
  date: format(new Date(), "yyyy-MM-dd"),
  start_time: "08:00",
  end_time: "",
  kids: [],
  category: "activity",
  location: "",
  notes: "",
  is_recurring: false,
};

export default function AddScheduleDialog({ open, onOpenChange, editEntry }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const user = useCurrentUser();

  const { data: kids = [] } = useQuery({
    queryKey: ["kids", user?.email],
    queryFn: () => base44.entities.Kid.filter({ created_by: user.email }),
    enabled: !!user,
  });

  useEffect(() => {
    if (editEntry) {
      setForm({ ...emptyForm, ...editEntry });
    } else {
      setForm(emptyForm);
    }
  }, [editEntry, open]);

  const handleSave = async () => {
    setSaving(true);
    if (editEntry?.id) {
      await base44.entities.ScheduleEntry.update(editEntry.id, form);
    } else {
      await base44.entities.ScheduleEntry.create(form);
    }
    queryClient.invalidateQueries({ queryKey: ["scheduleEntries"] });
    queryClient.invalidateQueries({ queryKey: ["recurringEntries"] });
    setSaving(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (editEntry?.id) {
      setSaving(true);
      try {
        await base44.entities.ScheduleEntry.delete(editEntry.id);
      } catch (e) {
        // entry may already be gone
      }
      queryClient.invalidateQueries({ queryKey: ["scheduleEntries"] });
      queryClient.invalidateQueries({ queryKey: ["recurringEntries"] });
      setSaving(false);
      onOpenChange(false);
    }
  };

  const toggleKid = (kidId) => {
    setForm(prev => ({
      ...prev,
      kids: prev.kids.includes(kidId)
        ? prev.kids.filter(id => id !== kidId)
        : [...prev.kids, kidId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editEntry ? "Edit Activity" : "Add Activity"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Lunch, Park time, Pickup"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Optional"
            />
          </div>

          {kids.length > 0 && (
            <div>
              <Label className="mb-2 block">People Involved</Label>
              <div className="flex flex-wrap gap-2">
                {kids.map(kid => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => toggleKid(kid.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-sm ${
                      form.kids.includes(kid.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <KidAvatar name={kid.name} color={kid.avatar_color} size="sm" />
                    <span className="font-medium">{kid.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional details..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.is_recurring}
              onCheckedChange={(checked) => setForm({ ...form, is_recurring: checked })}
            />
            <Label className="cursor-pointer">Repeat daily</Label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {editEntry && (
            <Button variant="destructive" onClick={handleDelete} disabled={saving} className="sm:mr-auto">
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title}>
            {saving ? "Saving..." : editEntry ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}