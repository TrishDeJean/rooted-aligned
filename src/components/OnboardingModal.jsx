import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import KidAvatar from "@/components/kids/KidAvatar";

const colors = ["purple", "peach", "teal", "pink", "amber", "sky", "lime"];

export default function OnboardingModal({ open, onComplete }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", birthday: "", avatar_color: "peach" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const data = { name: form.name.trim(), type: "adult", avatar_color: form.avatar_color };
    if (form.birthday) data.birthday = form.birthday;
    await base44.entities.Kid.create(data);
    queryClient.invalidateQueries({ queryKey: ["kids"] });
    setSaving(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Welcome! Let's set up your profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex justify-center">
            <KidAvatar name={form.name || "?"} color={form.avatar_color} size="xl" />
          </div>

          <div>
            <Label>Your name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="What should we call you?"
              autoFocus
            />
          </div>

          <div>
            <Label>Date of birth <span className="text-muted-foreground/50 font-normal">(optional)</span></Label>
            <Input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
          </div>

          <div>
            <Label className="mb-2 block">Pick a colour</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, avatar_color: c })} className="p-0.5">
                  <KidAvatar
                    name={form.name || "?"}
                    color={c}
                    size="md"
                    className={form.avatar_color === c ? "ring-2 ring-primary ring-offset-2" : "opacity-40"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full">
          {saving ? "Saving..." : "Get started"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}