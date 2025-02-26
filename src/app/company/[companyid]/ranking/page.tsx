import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoorOpenIcon as OpenAi, Bot, Chrome as Google } from "lucide-react";
import Link from "next/link";
import { getCompanyById } from "@/lib/actions";
import { notFound } from "next/navigation";

const providers = [
  {
    name: "GPT",
    company: "OpenAI",
    icon: OpenAi,
    models: ["4o mini", "3.5 Turbo", "4o latest"],
  },
  {
    name: "Claude",
    company: "Anthropic",
    icon: Bot,
    models: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku"],
  },
  {
    name: "Gemini",
    company: "Google",
    icon: Google,
    models: ["Gemini 1.5 Pro", "Gemini 1.5 Flash, Gemini 2.0 Flash"],
  },
];

export default async function RankServices({
  params,
}: {
  params: { companyid: string };
}) {
  const company = await getCompanyById(Number(params.companyid));
  if (!company) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Rankings by Search Service</h1>
      <p className="mb-6 text-muted-foreground">
        Search services contain multiple different AI models within them. We
        track ranking across the models as they add features, data refreshes,
        and algorithm updates.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Link
            href={`/company/${
              company.id
            }/ranking/${provider.name.toLowerCase()}`}
            key={provider.name}
          >
            <Card className="flex flex-col h-full transition-transform hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <provider.icon className="w-6 h-6" />
                  {provider.company}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <h3 className="font-semibold mb-2">Models:</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.models.map((model) => (
                    <Badge key={model} variant="secondary">
                      {model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
