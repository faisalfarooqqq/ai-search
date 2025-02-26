"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addCompanyWithQuestions } from "@/lib/actions";

export default function InputComponent() {
  const [site, setSite] = useState("");
  const [comapnyName, setCompanyName] = useState("");

  const [questions, setQuestions] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log("i was clicked");
    if (!site.trim()) {
      setError("Site URL is required.");
      return;
    }
    if (!questions.trim()) {
      setError("Questions field cannot be empty.");
      return;
    }
    if (!comapnyName.trim()) {
      setError("Company name is required.");
      return;
    }
    setError("");
    setSuccess("");

    setLoading(true);

    const questionArray = questions
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q !== "");

    try {
      await addCompanyWithQuestions(comapnyName, site, questionArray);
      setSuccess("Data saved successfully!");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("Error saving data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="site">Site URL</Label>
        <Input
          id="site"
          placeholder="Enter site URL"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          placeholder="Enter Company Name"
          value={comapnyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="questions">Questions</Label>
        <Textarea
          id="questions"
          placeholder="Enter your questions here"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          className="min-h-[600px]"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
