import { useCallback, useState } from "react";

export function useCanvas(canvasRef) {
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas?.getContext("2d");
  }, [canvasRef]);

  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      objects.forEach((obj) => {
        ctx.strokeStyle = obj.color;
        ctx.fillStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
        ctx.beginPath();
        if (obj.type === "line") {
          ctx.moveTo(obj.x, obj.y);
          obj.points?.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        } else if (obj.type === "shape") {
          if (obj.shape === "rectangle") {
            ctx.rect(obj.x, obj.y, obj.width || 0, obj.height || 0);
          } else if (obj.shape === "circle") {
            ctx.arc(
              obj.x + (obj.width || 0) / 2,
              obj.y + (obj.height || 0) / 2,
              (obj.width || 0) / 2,
              0,
              2 * Math.PI
            );
          } else if (obj.shape === "triangle") {
            ctx.moveTo(obj.x, obj.y + (obj.height || 0));
            ctx.lineTo(obj.x + (obj.width || 0) / 2, obj.y);
            ctx.lineTo(obj.x + (obj.width || 0), obj.y + (obj.height || 0));
            ctx.closePath();
          } else if (obj.shape === "star") {
            const spikes = 5;
            const outerRadius = (obj.width || 0) / 2;
            const innerRadius = outerRadius / 2;
            const cx = obj.x + (obj.width || 0) / 2;
            const cy = obj.y + (obj.height || 0) / 2;
            let rot = (Math.PI / 2) * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
              x = cx + Math.cos(rot) * outerRadius;
              y = cy + Math.sin(rot) * outerRadius;
              ctx.lineTo(x, y);
              rot += step;

              x = cx + Math.cos(rot) * innerRadius;
              y = cy + Math.sin(rot) * innerRadius;
              ctx.lineTo(x, y);
              rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
          }
          if (obj.fill) {
            ctx.fill();
          }
          ctx.stroke();
        } else if (obj.type === "image" && obj.image) {
          ctx.drawImage(
            obj.image,
            obj.x,
            obj.y,
            obj.width || 0,
            obj.height || 0
          );
        }
      });

      if (selectedObject) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          selectedObject.x - 5,
          selectedObject.y - 5,
          (selectedObject.width || 0) + 10,
          (selectedObject.height || 0) + 10
        );
        ctx.setLineDash([]);

        // Draw resize handles
        const handleSize = 8;
        const handles = [
          {
            x: selectedObject.x - handleSize / 2,
            y: selectedObject.y - handleSize / 2,
          },
          {
            x: selectedObject.x + (selectedObject.width || 0) - handleSize / 2,
            y: selectedObject.y - handleSize / 2,
          },
          {
            x: selectedObject.x - handleSize / 2,
            y: selectedObject.y + (selectedObject.height || 0) - handleSize / 2,
          },
          {
            x: selectedObject.x + (selectedObject.width || 0) - handleSize / 2,
            y: selectedObject.y + (selectedObject.height || 0) - handleSize / 2,
          },
        ];
        handles.forEach((handle) => {
          ctx.fillStyle = "white";
          ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
          ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
      }
    }
  }, [canvasRef, getContext, objects, selectedObject]);

  const startDrawing = useCallback((x, y, tool, color, lineWidth, shape) => {
    const newObject = {
      id: Date.now().toString(),
      type: tool === "brush" || tool === "pencil" ? "line" : "shape",
      x,
      y,
      color,
      lineWidth,
      points: tool === "brush" || tool === "pencil" ? [{ x, y }] : undefined,
      shape: tool === "shape" ? shape : undefined,
      width: 0,
      height: 0,
      fill: false,
    };
    setObjects((prev) => [...prev, newObject]);
  }, []);

  const continueDrawing = useCallback((x, y) => {
    setObjects((prev) => {
      const newObjects = [...prev];
      const currentObject = newObjects[newObjects.length - 1];
      if (currentObject.type === "line") {
        currentObject.points?.push({ x, y });
      } else if (currentObject.type === "shape") {
        currentObject.width = Math.abs(x - currentObject.x);
        currentObject.height = Math.abs(y - currentObject.y);
        if (x < currentObject.x) currentObject.x = x;
        if (y < currentObject.y) currentObject.y = y;
      }
      return newObjects;
    });
  }, []);

  const finishDrawing = useCallback(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const selectObject = useCallback(
    (x, y) => {
      const selected = objects.find((obj) => {
        if (obj.type === "line") {
          return obj.points?.some(
            (point) => Math.abs(point.x - x) < 10 && Math.abs(point.y - y) < 10
          );
        } else {
          return (
            x >= obj.x &&
            x <= obj.x + (obj.width || 0) &&
            y >= obj.y &&
            y <= obj.y + (obj.height || 0)
          );
        }
      });
      setSelectedObject(selected || null);
      redrawCanvas();
    },
    [objects, redrawCanvas]
  );

  const moveSelectedObject = useCallback(
    (dx, dy) => {
      if (selectedObject) {
        setObjects((prev) =>
          prev.map((obj) => {
            if (obj.id === selectedObject.id) {
              if (obj.type === "line") {
                return {
                  ...obj,
                  x: obj.x + dx,
                  y: obj.y + dy,
                  points: obj.points?.map((point) => ({
                    x: point.x + dx,
                    y: point.y + dy,
                  })),
                };
              } else {
                return {
                  ...obj,
                  x: obj.x + dx,
                  y: obj.y + dy,
                };
              }
            }
            return obj;
          })
        );
        setSelectedObject((prev) =>
          prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null
        );
        redrawCanvas();
      }
    },
    [selectedObject, redrawCanvas]
  );

  const resizeSelectedObject = useCallback(
    (width, height) => {
      if (
        selectedObject &&
        (selectedObject.type === "shape" || selectedObject.type === "image")
      ) {
        setObjects((prev) =>
          prev.map((obj) => {
            if (obj.id === selectedObject.id) {
              return {
                ...obj,
                width: Math.abs(width),
                height: Math.abs(height),
                x: width < 0 ? obj.x + width : obj.x,
                y: height < 0 ? obj.y + height : obj.y,
              };
            }
            return obj;
          })
        );
        setSelectedObject((prev) =>
          prev
            ? {
                ...prev,
                width: Math.abs(width),
                height: Math.abs(height),
                x: width < 0 ? prev.x + width : prev.x,
                y: height < 0 ? prev.y + height : prev.y,
              }
            : null
        );
        redrawCanvas();
      }
    },
    [selectedObject, redrawCanvas]
  );

  const deleteSelectedObject = useCallback(() => {
    if (selectedObject) {
      setObjects((prev) => prev.filter((obj) => obj.id !== selectedObject.id));
      setSelectedObject(null);
      redrawCanvas();
    }
  }, [selectedObject, redrawCanvas]);

  const fill = useCallback(
    (x, y, color) => {
      const ctx = getContext();
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        const targetObject = objects.find(
          (obj) =>
            obj.type === "shape" &&
            x >= obj.x &&
            x <= obj.x + (obj.width || 0) &&
            y >= obj.y &&
            y <= obj.y + (obj.height || 0)
        );

        if (targetObject) {
          setObjects((prev) =>
            prev.map((obj) =>
              obj.id === targetObject.id ? { ...obj, color, fill: true } : obj
            )
          );
        } else {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const targetColor = ctx.getImageData(x, y, 1, 1).data;
          const fillColor = hexToRgb(color);

          const floodFill = (x, y) => {
            const index = (y * canvas.width + x) * 4;
            if (
              x < 0 ||
              x >= canvas.width ||
              y < 0 ||
              y >= canvas.height ||
              imageData.data[index] !== targetColor[0] ||
              imageData.data[index + 1] !== targetColor[1] ||
              imageData.data[index + 2] !== targetColor[2] ||
              imageData.data[index + 3] !== targetColor[3]
            ) {
              return;
            }

            imageData.data[index] = fillColor[0];
            imageData.data[index + 1] = fillColor[1];
            imageData.data[index + 2] = fillColor[2];
            imageData.data[index + 3] = 255;

            floodFill(x + 1, y);
            floodFill(x - 1, y);
            floodFill(x, y + 1);
            floodFill(x, y - 1);
          };

          floodFill(x, y);
          ctx.putImageData(imageData, 0, 0);
        }
        redrawCanvas();
      }
    },
    [getContext, canvasRef, objects, redrawCanvas]
  );

  const addImage = useCallback(
    (img, x, y, width, height) => {
      const newObject = {
        id: Date.now().toString(),
        type: "image",
        x,
        y,
        width,
        height,
        image: img,
        color: "",
        lineWidth: 0,
      };
      setObjects((prev) => [...prev, newObject]);
      redrawCanvas();
    },
    [redrawCanvas]
  );

  const erase = useCallback(
    (x, y) => {
      setObjects((prev) =>
        prev.filter((obj) => {
          if (obj.type === "line") {
            return !obj.points?.some(
              (point) =>
                Math.abs(point.x - x) < 10 && Math.abs(point.y - y) < 10
            );
          } else if (obj.type === "shape" || obj.type === "image") {
            return !(
              x >= obj.x &&
              x <= obj.x + (obj.width || 0) &&
              y >= obj.y &&
              y <= obj.y + (obj.height || 0)
            );
          }
          return true;
        })
      );
      redrawCanvas();
    },
    [redrawCanvas]
  );

  return {
    objects,
    selectedObject,
    startDrawing,
    continueDrawing,
    finishDrawing,
    selectObject,
    moveSelectedObject,
    resizeSelectedObject,
    deleteSelectedObject,
    fill,
    addImage,
    erase,
    redrawCanvas,
  };
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}
