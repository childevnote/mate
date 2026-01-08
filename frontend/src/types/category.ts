export const CATEGORY_LABELS: Record<string, string> = {
  INFO: "정보",
  FREE: "자유",
  PROMO: "홍보",
  QUESTION: "질문",
  HUMOR: "유머",
  STUDY: "스터디",
  MARKET: "장터",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));