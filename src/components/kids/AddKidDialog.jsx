import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
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
import KidAvatar from "./KidAvatar";

const colors = ["purple", "peach", "teal", "pink", "amber", "sky", "lime"];

const emptyForm = {
  name: "",
  age: "",
  type: "home_boy",
  avatar_color: "purple",
  notes: "",
};

export default function AddKidDialog({ open, onOpenChange, editKid }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editKid) {
      setForm({ ...emptyForm, ...editKid, age: editKid.age?.toString() || "" });
    } else {
      setForm(emptyForm);
    }
  }, [editKid, open]);

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, age: form.age ? Number(form.age) : undefined };
    if (editKid?.id) {
      await base44.entities.Kid.update(editKid.id, data);
    } else {
      await base44.entities.Kid.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ["kids"] });
    setSaving(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (editKid?.id) {
      setSaving(true);
      await base44.entities.Kid.delete(editKid.id);
      queryClient.invalidateQueries({ queryKey: ["kids"] });
      setSaving(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editKid ? "Edit Kid" : "Add Kid"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-center">
            <KidAvatar name={form.name || "?"} color={form.avatar_color} size="xl" />
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Child's name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="work_kid">Work Kid</SelectItem>
                  <SelectItem value="home_boy">Home Boy</SelectItem>
                  <SelectItem value="niece">Niece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, avatar_color: c })}
                  className="p-0.5"
                >
                  <KidAvatar
                    name={form.name || "?"}
                    color={c}
                    size="md"
                    className={form.avatar_color === c ? "ring-2 ring-primary ring-offset-2" : "opacity-50"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Allergies, preferences, etc."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {editKid && (
            <Button variant="destructive" onClick={handleDelete} disabled={saving} className="sm:mr-auto">
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving ? "Saving..." : editKid ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}