import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropSave: (base64Result: string) => void;
  targetSize?: number;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropSave,
  targetSize = 200,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const VIEWPORT_SIZE = 300; // 300x300 preview square

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    setImageLoaded(false);
    setLoadError(null);
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      setLoadError(null);
    };
    img.onerror = () => {
      setImageLoaded(false);
      setLoadError('Your browser cannot decode this image format. Please upload a JPG, PNG, or WebP image.');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Calculate base scale and max pan bounds
  const getBounds = useCallback(() => {
    if (!imgRef.current) return { baseScale: 1, maxPanX: 0, maxPanY: 0 };
    const isSideways = rotation % 180 !== 0;
    const wEff = isSideways ? imgRef.current.naturalHeight : imgRef.current.naturalWidth;
    const hEff = isSideways ? imgRef.current.naturalWidth : imgRef.current.naturalHeight;

    const baseScale = Math.max(VIEWPORT_SIZE / wEff, VIEWPORT_SIZE / hEff);
    const renderedW = wEff * baseScale * zoom;
    const renderedH = hEff * baseScale * zoom;

    const maxPanX = Math.max(0, (renderedW - VIEWPORT_SIZE) / 2);
    const maxPanY = Math.max(0, (renderedH - VIEWPORT_SIZE) / 2);

    return { baseScale, maxPanX, maxPanY };
  }, [zoom, rotation]);

  // Draw preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { baseScale, maxPanX, maxPanY } = getBounds();

    // Clamp offsets
    const clampedX = Math.min(maxPanX, Math.max(-maxPanX, offsetX));
    const clampedY = Math.min(maxPanY, Math.max(-maxPanY, offsetY));

    ctx.clearRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Move to center of preview square
    ctx.translate(VIEWPORT_SIZE / 2 + clampedX, VIEWPORT_SIZE / 2 + clampedY);
    ctx.rotate((rotation * Math.PI) / 180);

    const currentScale = baseScale * zoom;
    ctx.scale(currentScale, currentScale);

    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }, [offsetX, offsetY, zoom, rotation, imageLoaded, getBounds]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Pointer drag events for Pan
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offsetX,
      y: e.clientY - offsetY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const { maxPanX, maxPanY } = getBounds();
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setOffsetX(Math.min(maxPanX, Math.max(-maxPanX, newX)));
    setOffsetY(Math.min(maxPanY, Math.max(-maxPanY, newY)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((z) => Math.min(3.0, Math.max(1.0, z + delta)));
  };

  // Export to 200x200 Canvas and Base64
  const handleSave = () => {
    const img = imgRef.current;
    if (!img || !imageLoaded) return;

    const { baseScale, maxPanX, maxPanY } = getBounds();
    const clampedX = Math.min(maxPanX, Math.max(-maxPanX, offsetX));
    const clampedY = Math.min(maxPanY, Math.max(-maxPanY, offsetY));

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetSize;
    exportCanvas.height = targetSize;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    const scaleFactor = targetSize / VIEWPORT_SIZE;

    expCtx.imageSmoothingEnabled = true;
    expCtx.imageSmoothingQuality = 'high';

    expCtx.translate(targetSize / 2 + clampedX * scaleFactor, targetSize / 2 + clampedY * scaleFactor);
    expCtx.rotate((rotation * Math.PI) / 180);

    const totalScale = baseScale * zoom * scaleFactor;
    expCtx.scale(totalScale, totalScale);

    expCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    // Export as high-quality JPEG
    const base64Result = exportCanvas.toDataURL('image/jpeg', 0.88);
    onCropSave(base64Result);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1200 }}
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1205 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '420px' }}>
          <div className="modal-content shadow-lg border-0">
            {/* Modal Header */}
            <div className="modal-header border-bottom py-3">
              <h5 className="modal-title fs-5 d-flex align-items-center mb-0">
                <i className="icon-base ri ri-crop-line text-primary me-2"></i>
                Crop & Position Image
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body p-4 d-flex flex-column align-items-center">
              {/* Canvas Crop Area */}
              <div
                className="position-relative overflow-hidden rounded shadow-sm"
                style={{
                  width: `${VIEWPORT_SIZE}px`,
                  height: `${VIEWPORT_SIZE}px`,
                  backgroundColor: '#1e1e2d',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}
              >
                {loadError ? (
                  <div className="d-flex flex-column justify-content-center align-items-center h-100 p-3 text-center text-white">
                    <i className="icon-base ri ri-error-warning-line text-warning fs-1 mb-2"></i>
                    <p className="text-warning fw-medium mb-2" style={{ fontSize: '0.85rem' }}>
                      {loadError}
                    </p>
                    <button type="button" className="btn btn-sm btn-outline-light mt-1" onClick={onClose}>
                      Close
                    </button>
                  </div>
                ) : !imageLoaded ? (
                  <div className="d-flex justify-content-center align-items-center h-100 text-white">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span>Loading image...</span>
                  </div>
                ) : null}
                <canvas
                  ref={canvasRef}
                  width={VIEWPORT_SIZE}
                  height={VIEWPORT_SIZE}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onWheel={handleWheel}
                  style={{ display: imageLoaded ? 'block' : 'none', width: '100%', height: '100%' }}
                />

                {/* Subtle Grid / Frame Overlay */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.75), inset 0 0 0 1px rgba(0, 0, 0, 0.25)',
                    pointerEvents: 'none',
                  }}
                >
                  {/* Rule of thirds lines */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '33.33%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  ></div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '66.66%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  ></div>
                  <div
                    style={{
                      position: 'absolute',
                      left: '33.33%',
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  ></div>
                  <div
                    style={{
                      position: 'absolute',
                      left: '66.66%',
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  ></div>
                </div>
              </div>

              {/* Helper text */}
              <div className="text-muted mt-2 text-center" style={{ fontSize: '0.8rem' }}>
                <i className="icon-base ri ri-drag-move-2-line me-1 text-secondary"></i>
                Drag to reposition &bull; Pinch or scroll to zoom
              </div>

              {/* Zoom & Rotation Controls */}
              <div className="d-flex align-items-center justify-content-center gap-2 mt-3 w-100" style={{ maxWidth: '320px' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-outline-secondary"
                  onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                  title="Zoom Out"
                >
                  <i className="icon-base ri ri-zoom-out-line"></i>
                </button>
                <input
                  type="range"
                  className="form-range flex-grow-1"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-outline-secondary"
                  onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                  title="Zoom In"
                >
                  <i className="icon-base ri ri-zoom-in-line"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-outline-secondary ms-1"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate 90° Clockwise"
                >
                  <i className="icon-base ri ri-anticlockwise-2-line"></i>
                </button>
              </div>

              <div className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>
                Output: <strong>{targetSize}×{targetSize} px (Square)</strong> &bull; Scale: {(zoom * 100).toFixed(0)}%
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top py-2 px-3 d-flex justify-content-between">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
                onClick={handleSave}
                disabled={!imageLoaded || !!loadError}
              >
                <i className="icon-base ri ri-check-line me-1"></i>
                Crop & Save (200×200)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
