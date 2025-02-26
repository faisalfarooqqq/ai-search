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

export default async function RankingTable({
  id,
  provider,
}: {
  id: number;
  provider: string;
}) {
  // Generic fetch function that takes the provider parameter
  const data = await fetchRankingData(id, provider);

  // Dynamically determine column headers based on provider
  const getColumnHeaders = () => {
    if (provider === "gpt") {
      return [
        { key: "question", label: "Question", className: "w-[100px]" },
        { key: "gpt35", label: "GPT-3.5 Turbo" },
        { key: "gpt4mini", label: "4o mini" },
        { key: "gpt4latest", label: "4o latest", className: "text-right" },
        // { key: "change", label: "Change", className: "text-right" },
        // {
        //   key: "latestResponse",
        //   label: "Latest Response",
        //   className: "text-right",
        // },
      ];
    } else if (provider === "claude") {
      return [
        { key: "question", label: "Question", className: "w-[100px]" },
        {
          key: "claude3Sonnet",
          label: "Claude 3.7 Sonnet",
          className: "text-right",
        },
        {
          key: "claude3Haiku",
          label: "Claude 3.5 Haiku",
          className: "text-right",
        },
        // { key: "change", label: "Change", className: "text-right" },
        // {
        //   key: "latestResponse",
        //   label: "Latest Response",
        //   className: "text-right",
        // },
      ];
    } else if (provider === "gemini") {
      return [
        { key: "question", label: "Question", className: "w-[100px]" },
        { key: "geminiFlash20", label: "Gemini Flast 2.0" },
        { key: "geminiFlash15", label: "Gemini Flash 1.5" },
        { key: "geminiPro", label: "Gemini Pro", className: "text-right" },
        // { key: "change", label: "Change", className: "text-right" },
        // {
        //   key: "latestResponse",
        //   label: "Latest Response",
        //   className: "text-right",
        // },
      ];
    } else {
      // Default or generic headers
      return [
        { key: "question", label: "Question", className: "w-[100px]" },
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

  // Helper function to get value from row based on header key
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
    <div>
      <div>
        <FetchNewButton id={id} provider={provider} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header.key} className={header.className || ""}>
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {headers.map((header) => (
                <TableCell
                  key={`${index}-${header.key}`}
                  className={
                    header.key !== "question" && header.className
                      ? header.className
                      : ""
                  }
                >
                  {getCellValue(row, header.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
