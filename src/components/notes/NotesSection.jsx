import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StickyNote, Plus, Trash2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function NotesSection() {
  const [text, setText] = useState("");
  const [isReminder, setIsReminder] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: () => base44.entities.Note.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setText(""); setIsReminder(false); setDueDate(""); setAdding(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }) => base44.entities.Note.update(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const handleAdd = () => {
    if (!text.trim()) return;
    createMutation.mutate({ content: text.trim(), is_reminder: isReminder, due_date: dueDate || undefined, completed: false });
  };

  const active = notes.filter(n => !n.completed);
  const done = notes.filter(n => n.completed);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-accent" />
          Notes & Reminders
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setAdding(v => !v)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {adding && (
        <Card className="p-3 space-y-2 border-primary/20">
          <Input
            placeholder="Write a note or reminder..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={isReminder} onCheckedChange={setIsReminder} />
              <Bell className="h-3.5 w-3.5 text-accent" />
              Reminder
            </label>
            {isReminder && (
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="text-sm border border-border rounded-md px-2 py-1 bg-background"
              />
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} disabled={!text.trim() || createMutation.isPending}>Save</Button>
            </div>
          </div>
        </Card>
      )}

      {active.length === 0 && !adding && (
        <Card className="p-5 text-center border-dashed">
          <p className="text-sm text-muted-foreground">No notes yet — tap Add to jot something down</p>
        </Card>
      )}

      <div className="space-y-2">
        {active.map(note => (
          <NoteItem key={note.id} note={note} onToggle={toggleMutation.mutate} onDelete={deleteMutation.mutate} />
        ))}
      </div>

      {done.length > 0 && (
        <details className="group">
          <summary className="text-xs font-medium text-muted-foreground cursor-pointer select-none mb-2">
            Completed ({done.length})
          </summary>
          <div className="space-y-2 mt-2">
            {done.map(note => (
              <NoteItem key={note.id} note={note} onToggle={toggleMutation.mutate} onDelete={deleteMutation.mutate} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function NoteItem({ note, onToggle, onDelete }) {
  return (
    <Card className={cn("p-3 flex items-start gap-3 group/note", note.completed && "opacity-60")}>
      <Checkbox
        checked={note.completed}
        onCheckedChange={checked => onToggle({ id: note.id, completed: checked })}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", note.completed && "line-through text-muted-foreground")}>{note.content}</p>
        {note.is_reminder && note.due_date && (
          <p className="text-xs text-accent mt-0.5 flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {format(new Date(note.due_date + "T00:00:00"), "MMM d")}
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(note.id)}
        className="opacity-0 group-hover/note:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </Card>
  );
}