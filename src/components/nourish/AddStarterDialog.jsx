import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const empty = { name: "", notes: "", variety: "" };

const VARIETIES = [
  { key: "all_purpose", label: "Unbleached All Purpose", emoji: "🌾" },
  { key: "half_half", label: "Half & Half", emoji: "⚖️" },
  { key: "whole_wheat", label: "Whole Wheat", emoji: "🌿" },
  { key: "chocolate", label: "Chocolate", emoji: "🍫" },
];

export default function AddStarterDialog({ open, onOpenChange, editStarter, suggestedNames = [] }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setForm(editStarter ? { name: editStarter.name, notes: editStarter.notes || "", variety: editStarter.variety || "" } : empty);
  }, [editStarter, open]);

  const handleSave = async () => {
    setSaving(true);
    if (editStarter?.id) {
      await base44.entities.Starter.update(editStarter.id, form);
    } else {
      await base44.entities.Starter.create({ ...form, is_active: true });
    }
    queryClient.invalidateQueries({ queryKey: ["starters"] });
    setSaving(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!editStarter?.id) return;
    setSaving(true);
    await base44.entities.Starter.delete(editStarter.id);
    queryClient.invalidateQueries({ queryKey: ["starters"] });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editStarter ? "Edit Starter" : "New Starter"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lorelai, Georgia..."
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestedNames.map(n => (
                <button
                  key={n}
                  onClick={() => setForm({ ...form, name: n })}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Variety</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {VARIETIES.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, variety: form.variety === key ? "" : key })}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    form.variety === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Smell, rise, mood, hydration..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {editStarter && (
            <Button variant="destructive" onClick={handleDelete} disabled={saving} className="sm:mr-auto">
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving ? "Saving..." : editStarter ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}