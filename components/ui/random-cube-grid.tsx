"use client";
import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type RandomCubeGridProps = {
  text?: string;
  gridCols?: number;
  gridRows?: number;
  maxElevation?: number;
  elevationSmoothing?: number;
  backgroundColor?: string;
  cubeColor?: string;
  gapRatio?: number;
  className?: string;
};

type PixelData = {
  targetElevation: number;
  currentElevation: number;
  targetColor: { r: number, g: number, b: number };
  currentColor: { r: number, g: number, b: number };
};

export const RandomCubeGrid: React.FC<RandomCubeGridProps> = ({
  text = "",
  gridCols = 50,
  gridRows = 30,
  maxElevation = 25,
  elevationSmoothing = 0.08, 
  backgroundColor = "transparent",
  cubeColor = "#27272a", // zinc-800
  gapRatio = 0.1,
  className,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const pixelDataRef = useRef<PixelData[][]>([]);

  const textMaskRef = useRef<Uint8ClampedArray | null>(null);

  // Parse default cube color
  const defaultCubeRGB = React.useMemo(() => {
    const hex = cubeColor.replace("#", "");
    return {
      r: parseInt(hex.length === 3 ? hex[0]+hex[0] : hex.slice(0, 2), 16),
      g: parseInt(hex.length === 3 ? hex[1]+hex[1] : hex.slice(2, 4), 16),
      b: parseInt(hex.length === 3 ? hex[2]+hex[2] : hex.slice(4, 6), 16),
    };
  }, [cubeColor]);

  // Generate the Text Mask
  useEffect(() => {
    if (!text) {
      textMaskRef.current = null;
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = gridCols;
    canvas.height = gridRows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gridCols, gridRows);

    // Dynamic Font Scaling
    // We want the text to fit cleanly inside the grid's columns, but not exceed its rows
    const fontSize = Math.min(
      gridRows * 0.25, 
      Math.floor(gridCols / (text.length * 1.2))
    ); 
    
    ctx.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Add letter spacing so the pixelated cubes don't merge together
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).letterSpacing = "2px";
    
    // Draw text perfectly in the center
    ctx.fillText(text.toUpperCase(), gridCols / 2, gridRows / 2);

    const imageData = ctx.getImageData(0, 0, gridCols, gridRows);
    textMaskRef.current = imageData.data;
  }, [text, gridCols, gridRows]);

  // Initialize pixel data
  useEffect(() => {
    pixelDataRef.current = Array.from({ length: gridRows }, () =>
      Array.from({ length: gridCols }, () => ({
        targetElevation: 0,
        currentElevation: 0,
        targetColor: { ...defaultCubeRGB },
        currentColor: { ...defaultCubeRGB },
      }))
    );
  }, [gridCols, gridRows, defaultCubeRGB]);

  // Main render loop
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const displayCanvas = displayCanvasRef.current;
      if (!displayCanvas) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const dispCtx = displayCanvas.getContext("2d");
      if (!dispCtx) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const pixels = pixelDataRef.current;
      const mask = textMaskRef.current;
      const time = Date.now() / 1000;

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const pixel = pixels[row]?.[col];
          if (!pixel) continue;

          let isTextPixel = false;
          if (mask) {
            // Check the red channel of the pixel in the text mask
            const alpha = mask[(row * gridCols + col) * 4]; 
            if (alpha > 128) {
              isTextPixel = true;
            }
          }

          if (isTextPixel) {
            // Text characters pop up high to look like deep 3D cubes
            const wave = Math.sin(col * 0.5 + row * 0.5 - time * 4) * (maxElevation * 0.4);
            pixel.targetElevation = (maxElevation * 1.8) + wave;
            pixel.targetColor = defaultCubeRGB; 
          } else {
            // Empty space is chaotic noise
            pixel.targetColor = defaultCubeRGB;
            
            if (Math.random() < 0.005) {
              // Randomly pop up deeply to maintain the 3D aesthetic
              pixel.targetElevation = Math.random() * maxElevation;
            } else if (Math.random() < 0.02) {
              // Randomly drop back down
              pixel.targetElevation = 0;
            }
          }

          // Smooth elevation transition
          pixel.currentElevation += (pixel.targetElevation - pixel.currentElevation) * elevationSmoothing;
          
          // Smooth color transition
          pixel.currentColor.r += (pixel.targetColor.r - pixel.currentColor.r) * elevationSmoothing;
          pixel.currentColor.g += (pixel.targetColor.g - pixel.currentColor.g) * elevationSmoothing;
          pixel.currentColor.b += (pixel.targetColor.b - pixel.currentColor.b) * elevationSmoothing;
        }
      }

      // Render to display canvas
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = displayCanvas.clientWidth;
      const displayHeight = displayCanvas.clientHeight;

      displayCanvas.width = displayWidth * dpr;
      displayCanvas.height = displayHeight * dpr;
      dispCtx.scale(dpr, dpr);

      // Clear canvas
      dispCtx.fillStyle = backgroundColor;
      dispCtx.clearRect(0, 0, displayWidth, displayHeight); 
      if (backgroundColor !== "transparent") {
        dispCtx.fillRect(0, 0, displayWidth, displayHeight);
      }

      const cellSize = Math.max(displayWidth / gridCols, displayHeight / gridRows);
      const gap = cellSize * gapRatio;

      const gridWidth = cellSize * gridCols;
      const gridHeight = cellSize * gridRows;
      const offsetXGrid = (displayWidth - gridWidth) / 2;
      const offsetYGrid = (displayHeight - gridHeight) / 2;

      // Draw cells with 3D effect
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const pixel = pixels[row]?.[col];
          if (!pixel) continue;

          const x = offsetXGrid + col * cellSize;
          const y = offsetYGrid + row * cellSize;
          const elevation = pixel.currentElevation;
          const color = pixel.currentColor;

          // Isometric projection offset
          const offsetX = -elevation * 1.2;
          const offsetY = -elevation * 1.8;

          // Draw shadow
          if (elevation > 0.5) {
            dispCtx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.6, elevation * 0.04)})`;
            dispCtx.fillRect(
              x + gap / 2 + elevation * 1.5,
              y + gap / 2 + elevation * 2.0,
              cellSize - gap,
              cellSize - gap,
            );
          }

          // Draw side faces
          if (elevation > 0.5) {
            // Right side
            dispCtx.fillStyle = `rgb(${Math.max(0, color.r - 40)}, ${Math.max(0, color.g - 40)}, ${Math.max(0, color.b - 40)})`;
            dispCtx.beginPath();
            dispCtx.moveTo(x + cellSize - gap / 2 + offsetX, y + gap / 2 + offsetY);
            dispCtx.lineTo(x + cellSize - gap / 2, y + gap / 2);
            dispCtx.lineTo(x + cellSize - gap / 2, y + cellSize - gap / 2);
            dispCtx.lineTo(x + cellSize - gap / 2 + offsetX, y + cellSize - gap / 2 + offsetY);
            dispCtx.closePath();
            dispCtx.fill();

            // Bottom side
            dispCtx.fillStyle = `rgb(${Math.max(0, color.r - 60)}, ${Math.max(0, color.g - 60)}, ${Math.max(0, color.b - 60)})`;
            dispCtx.beginPath();
            dispCtx.moveTo(x + gap / 2 + offsetX, y + cellSize - gap / 2 + offsetY);
            dispCtx.lineTo(x + gap / 2, y + cellSize - gap / 2);
            dispCtx.lineTo(x + cellSize - gap / 2, y + cellSize - gap / 2);
            dispCtx.lineTo(x + cellSize - gap / 2 + offsetX, y + cellSize - gap / 2 + offsetY);
            dispCtx.closePath();
            dispCtx.fill();
          }

          // Draw top face
          const brightness = 1 + (elevation / maxElevation) * 0.4;
          dispCtx.fillStyle = `rgb(${Math.min(255, Math.round(color.r * brightness))}, ${Math.min(255, Math.round(color.g * brightness))}, ${Math.min(255, Math.round(color.b * brightness))})`;
          dispCtx.fillRect(x + gap / 2 + offsetX, y + gap / 2 + offsetY, cellSize - gap, cellSize - gap);

          // Border
          dispCtx.strokeStyle = `rgba(255, 255, 255, ${0.05 + elevation * 0.01})`;
          dispCtx.lineWidth = 0.5;
          dispCtx.strokeRect(x + gap / 2 + offsetX, y + gap / 2 + offsetY, cellSize - gap, cellSize - gap);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [gridCols, gridRows, maxElevation, elevationSmoothing, backgroundColor, defaultCubeRGB, gapRatio]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <canvas ref={displayCanvasRef} className="h-full w-full" style={{ backgroundColor }} />
    </div>
  );
};
