"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function InputComponent() {
  const [site, setSite] = useState("");
  const [questions, setQuestions] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!site.trim()) {
      setError("Site URL is required.");
      return;
    }
    if (!questions.trim()) {
      setError("Questions field cannot be empty.");
      return;
    }
    setError("");

    const data = { site, questions };
    localStorage.setItem("formatData", JSON.stringify(data));
    alert("Saved Sucessfully");
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="site">Site</Label>
        <Input
          id="site"
          placeholder="Enter site URL"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="questions">Questions</Label>
        <Textarea
          id="questions"
          placeholder="Enter your questions here"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          className="min-h-[200px]"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}

      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}
