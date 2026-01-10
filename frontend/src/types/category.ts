// 카테고리 라벨 상수
export const CATEGORY_LABELS = {
  INFO: "정보",
  FREE: "자유",
  PROMO: "홍보",
  QUESTION: "질문",
  HUMOR: "유머",
  STUDY: "스터디",
  MARKET: "장터",
} as const;

// 카테고리 타입 추출 (이제 string이 아니라 "INFO" | "FREE" ... 타입이 됨)
export type BoardCategory = keyof typeof CATEGORY_LABELS;

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as BoardCategory,
  label,
}));