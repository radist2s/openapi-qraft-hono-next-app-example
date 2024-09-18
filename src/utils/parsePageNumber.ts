export function parsePageNumber(params: { page?: string[] } | undefined) {
  if (!params?.page) return 1;
  const pageParsed = Number(params.page[0]);
  if (Number.isNaN(pageParsed)) return 1;
  return Math.max(1, pageParsed);
}
