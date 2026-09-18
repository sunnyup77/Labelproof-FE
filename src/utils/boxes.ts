// Bounding box utilities
// Coordinate convention (CONTRACTS.md §0): [x1, y1, x2, y2] = [left, top, right, bottom]
// from the TOP-LEFT corner of the processed image.
// We normalize to percentages for the CSS overlay on the displayed image.

import type { BoundingBox, ExtractionImageDimensions } from '../types/contracts';

export interface NormalizedBox {
  left: number;   // 0–100 %
  top: number;
  width: number;
  height: number;
}

// Convert pixel box + image dims → percentage-based CSS position
export function normalizeBox(
  box: BoundingBox,
  imageDims: ExtractionImageDimensions,
): NormalizedBox {
  const [x1, y1, x2, y2] = box;
  return {
    left: (x1 / imageDims.width) * 100,
    top: (y1 / imageDims.height) * 100,
    width: ((x2 - x1) / imageDims.width) * 100,
    height: ((y2 - y1) / imageDims.height) * 100,
  };
}

// Convert to inline CSS style object for an overlay <div>
export function boxToStyle(box: BoundingBox, imageDims: ExtractionImageDimensions): React.CSSProperties {
  const n = normalizeBox(box, imageDims);
  return {
    position: 'absolute',
    left: `${n.left}%`,
    top: `${n.top}%`,
    width: `${n.width}%`,
    height: `${n.height}%`,
  };
}
