export const formatScore = (score?: number): string => {
  if (score === undefined) return '0%';
  return `${Math.round(score * 100)}%`;
}; 