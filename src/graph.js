/**
 * SVG 내부 요소들의 bbox를 계산해 viewBox를 설정하여
 * 드래그 없이 전체가 보이도록 중앙에 맞추고 약간의 여유(padding)를 둠.
 * svg: SVGElement, paddingPercent: 0..0.5 (예: 0.08 = 8%)
 */
export function fitSvgToContent(svg, paddingPercent = 0.08) {
  if (!svg || typeof svg.getBBox !== 'function') return;
  try {
    // 그룹 전체 bbox (모든 시각 요소가 그룹으로 묶여있다면 그 그룹을 넘겨도 됨)
    const g = svg.querySelector('g') || svg;
    const bbox = g.getBBox();
    if (bbox.width === 0 && bbox.height === 0) return;

    const padW = bbox.width * paddingPercent;
    const padH = bbox.height * paddingPercent;

    const minX = bbox.x - padW;
    const minY = bbox.y - padH;
    const width = bbox.width + padW * 2;
    const height = bbox.height + padH * 2;

    svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
    // preserveAspectRatio을 통해 중앙 정렬 및 축소 허용
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  } catch (e) {
    // 브라우저 호환성 안전 처리
    console.warn('fitSvgToContent 실패:', e);
  }
}

// 그래프 초기화 후 호출 예시
export function renderGraph(svg) {
  // ...existing code to draw axes, curves, arrows...
  // 모든 그리기 작업이 끝난 뒤 호출
  fitSvgToContent(svg, 0.08);
}