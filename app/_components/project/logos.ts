// 프로젝트별 로고 이미지 대신, id 기반으로 이니셜 모노그램의 색을 결정한다.
const MONOGRAM_COLORS = ["text-primary", "text-secondary", "text-point"] as const;

export const getProjectMonogramColor = (id: number) => MONOGRAM_COLORS[id % MONOGRAM_COLORS.length];
