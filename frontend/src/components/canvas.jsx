import { useRef, useState, useEffect } from 'react';
import { DrawingTools } from './drawing-tools';
import { ColorPicker } from './color-picker';
import { useCanvas } from '../hooks/use-canvas';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import io from 'socket.io-client';
import './ui/css/canvas.css';

const socket = io('http://localhost:4000');

export default function Canvas() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [shape, setShape] = useState('rectangle');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const {
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
  } = useCanvas(canvasRef);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('sessionId');
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      socket.emit('join', sessionIdFromUrl);
    }
  }, []);

  useEffect(() => {
    socket.on('drawing', (data) => {
      const { x, y, tool, color, lineWidth, shape, action } = data;
      if (action === 'start') {
        startDrawing(x, y, tool, color, lineWidth, shape);
      } else if (action === 'continue') {
        continueDrawing(x, y);
      } else if (action === 'finish') {
        finishDrawing();
      } else if (action === 'erase') {
        erase(x, y);
      } else if (action === 'fill') {
        fill(x, y, color);
      }
      redrawCanvas();
    });

    return () => {
      socket.off('drawing');
    };
  }, [startDrawing, continueDrawing, finishDrawing, erase, fill, redrawCanvas]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDrawing(true);

    if (tool === 'fill') {
      fill(x, y, color);
      socket.emit('drawing', { sessionId, x, y, color, action: 'fill' });
    } else if (tool === 'select') {
      selectObject(x, y);
      const resizeHandle = getResizeHandle(x, y);
      if (resizeHandle !== null) {
        setIsResizing(true);
      }
    } else if (tool === 'eraser') {
      erase(x, y);
      socket.emit('drawing', { sessionId, x, y, action: 'erase' });
    } else if (tool === 'shape' || tool === 'brush' || tool === 'pencil') {
      startDrawing(x, y, tool, color, lineWidth, shape);
      socket.emit('drawing', { sessionId, x, y, tool, color, lineWidth, shape, action: 'start' });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing && !isResizing) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !startPos) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizing && selectedObject) {
      const newWidth = x - selectedObject.x;
      const newHeight = y - selectedObject.y;
      resizeSelectedObject(newWidth, newHeight);
    } else if (tool === 'select' && selectedObject) {
      moveSelectedObject(x - startPos.x, y - startPos.y);
      setStartPos({ x, y });
    } else if (tool === 'eraser') {
      erase(x, y);
      socket.emit('drawing', { sessionId, x, y, action: 'erase' });
    } else if (tool === 'shape' || tool === 'brush' || tool === 'pencil') {
      continueDrawing(x, y);
      socket.emit('drawing', { sessionId, x, y, action: 'continue' });
    }

    redrawCanvas();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsResizing(false);
    setStartPos(null);
    finishDrawing();
    socket.emit('drawing', { sessionId, action: 'finish' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const aspectRatio = img.width / img.height;
            const maxWidth = canvas.width * 0.8;
            const maxHeight = canvas.height * 0.8;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
            addImage(img, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
          }
        };
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSelected = () => {
    deleteSelectedObject();
  };

  const getResizeHandle = (x, y) => {
    if (!selectedObject) return null;

    const handleSize = 8;
    const handles = [
      { x: selectedObject.x - handleSize / 2, y: selectedObject.y - handleSize / 2 },
      { x: selectedObject.x + (selectedObject.width || 0) - handleSize / 2, y: selectedObject.y - handleSize / 2 },
      { x: selectedObject.x - handleSize / 2, y: selectedObject.y + (selectedObject.height || 0) - handleSize / 2 },
      { x: selectedObject.x + (selectedObject.width || 0) - handleSize / 2, y: selectedObject.y + (selectedObject.height || 0) - handleSize / 2 },
    ];

    for (let i = 0; i < handles.length; i++) {
      if (
        x >= handles[i].x &&
        x <= handles[i].x + handleSize &&
        y >= handles[i].y &&
        y <= handles[i].y + handleSize
      ) {
        return i;
      }
    }

    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1b4b]">
      <div className="flex-1 relative overflow-hidden p-4">
        <canvas
          ref={canvasRef}
          width={1210}
          height={690}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-white rounded-lg shadow-lg mx-auto"
        />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <DrawingTools
            currentTool={tool}
            onToolChange={setTool}
            currentShape={shape}
            onShapeChange={setShape}
          />
          <ColorPicker color={color} onChange={setColor} />
          <div className="flex items-center space-x-2">
            <span>Line Width:</span>
            <Slider
              value={[lineWidth]}
              onValueChange={(value) => setLineWidth(value[0])}
              min={1}
              max={50}
              step={1}
              className="w-32"
            />
          </div>
          {tool === 'sprite' && (
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          )}
          {selectedObject && (
            <Button onClick={handleDeleteSelected} variant="destructive">
              Delete Selected
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}