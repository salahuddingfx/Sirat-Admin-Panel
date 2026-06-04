import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "./Button";
import "./ImageGallery.css";

export function ImageGallery({ images = [], initialIndex = 0, onClose, alt = "Image" }) {
  const imageUrls = images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const intervalRef = useRef(null);
  const imageRef = useRef(null);

  const currentImage = imageUrls[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < imageUrls.length - 1;

  const goTo = useCallback((index) => {
    setCurrentIndex(index);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goPrev = useCallback(() => {
    if (hasPrev) goTo(currentIndex - 1);
  }, [hasPrev, currentIndex, goTo]);

  const goNext = useCallback(() => {
    if (hasNext) goTo(currentIndex + 1);
  }, [hasNext, currentIndex, goTo]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 5));
  const handleZoomOut = () => {
    setZoom(z => {
      const newZoom = Math.max(z - 0.5, 0.5);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };
  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const togglePlay = () => setIsPlaying(p => !p);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= imageUrls.length) {
            setIsPlaying(false);
            return prev;
          }
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, imageUrls.length]);

  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleZoomReset();
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goPrev, goNext]);

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  if (!images || images.length === 0) return null;

  return (
    <div
      className="gallery-overlay"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="gallery-toolbar">
        <div className="gallery-counter">{currentIndex + 1} / {images.length}</div>
        <div className="gallery-toolbar-center">
          <Button variant="ghost" onClick={handleZoomOut} title="Zoom Out (-)" className="gallery-btn">
            <ZoomOut size={18} />
          </Button>
          <span className="gallery-zoom-level">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" onClick={handleZoomIn} title="Zoom In (+)" className="gallery-btn">
            <ZoomIn size={18} />
          </Button>
          {zoom !== 1 && (
            <Button variant="ghost" onClick={handleZoomReset} title="Reset Zoom (0)" className="gallery-btn">
              <RotateCcw size={16} />
            </Button>
          )}
          <Button variant="ghost" onClick={togglePlay} title="Auto-play (Space)" className="gallery-btn">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </Button>
        </div>
        <Button variant="ghost" onClick={onClose} title="Close (Esc)" className="gallery-btn gallery-close-btn">
          <X size={22} />
        </Button>
      </div>

      <div className="gallery-main" onWheel={handleWheel}>
        {hasPrev && (
          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); goPrev(); }} className="gallery-nav gallery-nav-prev" title="Previous (←)">
            <ChevronLeft size={32} />
          </Button>
        )}

        <div
          className="gallery-image-wrapper"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          style={{ cursor: zoom > 1 ? "grab" : "default" }}
        >
          <img
            ref={imageRef}
            src={currentImage}
            alt={`${alt} ${currentIndex + 1}`}
            className="gallery-image"
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.2s ease",
            }}
          />
        </div>

        {hasNext && (
          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); goNext(); }} className="gallery-nav gallery-nav-next" title="Next (→)">
            <ChevronRight size={32} />
          </Button>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={i}
              className={`gallery-thumb ${i === currentIndex ? "gallery-thumb--active" : ""}`}
              onClick={() => goTo(i)}
            >
              <img src={img} alt={`${alt} thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
