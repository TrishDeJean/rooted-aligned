import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useCurrentUser, userKey } from "@/hooks/useCurrentUser";

export default function OnYourMind() {
  const user = useCurrentUser();
  const storageKey = userKey(user, "on_your_mind");

  const [text, setText] = useState("");
  const timerRef = useRef(null);

  // Load from storage once user is available
  useEffect(() => {
    setText(localStorage.getItem(storageKey) || "");
  }, [storageKey]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => localStorage.setItem(storageKey, val), 500);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold">On your mind</h3>
      <Card className="border-border/50">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Whatever's floating around up there... ☁️"
          className="w-full min-h-[80px] p-4 text-sm bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground/40 text-foreground leading-relaxed rounded-xl"
        />
      </Card>
    </div>
  );
}