export function extractRank(
  responseText: string | undefined,
  companyName: string,
  companyUrl: string
): number | null {
  if (!responseText) return null;

  const normalizedCompanyUrl = companyUrl.toLowerCase();
  const normalizedCompanyName = companyName.toLowerCase();

  // This regex finds lines starting with a number followed by a period or parenthesis.
  const regex = /(\d+)[\.\)]\s*(.*)/g;
  let match;
  while ((match = regex.exec(responseText)) !== null) {
    const rank = parseInt(match[1], 10);
    const lineText = match[2].toLowerCase();
    // Check if the line contains either the company URL or the company name.
    if (
      lineText.includes(normalizedCompanyUrl) ||
      lineText.includes(normalizedCompanyName)
    ) {
      return rank;
    }
  }
  return null;
}
