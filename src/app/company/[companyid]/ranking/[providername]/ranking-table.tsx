import FetchNewButton from "@/components/ui/fetchNewButton";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { fetchRankingData } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper function to get provider display name
function getProviderDisplayName(provider: string) {
  switch (provider) {
    case "gpt":
      return "OpenAI GPT Models";
    case "claude":
      return "Anthropic Claude Models";
    case "gemini":
      return "Google Gemini Models";
    default:
      return "AI Models";
  }
}

// Helper function to render rank with visual indicator
function getRankBadge(rank: any) {
  if (rank === null || rank === "N/A") {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const rankNum = typeof rank === "string" ? Number.parseInt(rank, 10) : rank;

  // Determine badge color based on rank
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" =
    "outline";
  if (rankNum <= 3) badgeVariant = "default";
  else if (rankNum <= 6) badgeVariant = "secondary";
  else badgeVariant = "destructive";

  return (
    <Badge variant={badgeVariant} className="font-medium">
      {rank}
    </Badge>
  );
}

export default async function RankingTable({
  id,
  provider,
}: {
  id: number;
  provider: string;
}) {
  // Keep original data fetching logic
  const data = await fetchRankingData(id, provider);

  // Dynamically determine column headers based on provider (unchanged)
  const getColumnHeaders = () => {
    if (provider === "gpt") {
      return [
        { key: "question", label: "Question", className: "w-[250px]" },
        { key: "gpt35", label: "GPT-3.5 Turbo" },
        { key: "gpt4mini", label: "4o mini" },
        { key: "gpt4latest", label: "4o latest", className: "text-right" },
      ];
    } else if (provider === "claude") {
      return [
        { key: "question", label: "Question", className: "w-[250px]" },
        {
          key: "claude3Sonnet",
          label: "Claude 3.7 Sonnet",
        },
        {
          key: "claude3Haiku",
          label: "Claude 3.5 Haiku",
          className: "text-right",
        },
      ];
    } else if (provider === "gemini") {
      return [
        { key: "question", label: "Question", className: "w-[250px]" },
        { key: "geminiFlash20", label: "Gemini Flash 2.0" },
        { key: "geminiFlash15", label: "Gemini Flash 1.5" },
        { key: "geminiPro", label: "Gemini Pro", className: "text-right" },
      ];
    } else {
      // Default or generic headers
      return [
        { key: "question", label: "Question", className: "w-[250px]" },
        { key: "model1", label: "Model 1" },
        { key: "model2", label: "Model 2" },
        { key: "latestModel", label: "Latest Model", className: "text-right" },
        { key: "change", label: "Change", className: "text-right" },
        {
          key: "latestResponse",
          label: "Latest Response",
          className: "text-right",
        },
      ];
    }
  };

  const headers = getColumnHeaders();

  // Helper function to get value from row based on header key (unchanged)
  const getCellValue = (row, key) => {
    if (key === "question") return row.question;
    if (key === "change") return row.change !== null ? row.change : "N/A";
    if (key === "latestResponse") return row.latestResponse || "N/A";

    // For model-specific fields
    if (row[key]) {
      return row[key].rank ?? "N/A";
    }
    return "N/A";
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          {getProviderDisplayName(provider)} Rankings
        </CardTitle>
        <FetchNewButton id={id} provider={provider} />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
            <p className="text-center text-muted-foreground">
              No ranking data available
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {headers.map((header) => (
                    <TableHead
                      key={header.key}
                      className={header.className || ""}
                    >
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    {headers.map((header) => (
                      <TableCell
                        key={`${index}-${header.key}`}
                        className={
                          header.key !== "question" && header.className
                            ? header.className
                            : ""
                        }
                      >
                        {header.key === "question" ? (
                          <div className="font-medium">
                            {getCellValue(row, header.key)}
                          </div>
                        ) : header.key === "change" ||
                          header.key === "latestResponse" ? (
                          getCellValue(row, header.key)
                        ) : (
                          getRankBadge(getCellValue(row, header.key))
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
