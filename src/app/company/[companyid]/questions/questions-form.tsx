"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateCompanyQuestions } from "@/lib/actions";
import { toast } from "sonner";

export default function QuestionsForm({
  initialQuestions,
  companyId,
}: {
  initialQuestions: string[];
  companyId: number;
}) {
  const [questions, setQuestions] = useState<string>(
    initialQuestions.join("\n")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newQuestions = questions.split("\n").filter((q) => q.trim() !== "");
      const result = await updateCompanyQuestions(companyId, newQuestions);
      if (result.success) {
        toast.success("Questions updated successfully");
      } else {
        throw new Error("Failed to update questions");
      }
    } catch (error) {
      console.error("Error updating questions:", error);
      toast.error("Failed to update questions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        id="questions"
        placeholder="Enter your questions here, one per line"
        value={questions}
        onChange={(e) => setQuestions(e.target.value)}
        className="min-h-[400px]"
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Questions"}
      </Button>
    </form>
  );
}
