import { MousePointer, Square, Paintbrush, Pencil, Eraser, Droplet, ImageIcon, Circle, Triangle, Star } from 'lucide-react';
import { Button } from './ui/button';
import './ui/css/drawing-tools.css';

export function DrawingTools({ currentTool, onToolChange, currentShape, onShapeChange }) {
    const tools = [
        { id: 'select', icon: MousePointer, label: 'Seleccionar' },
        { id: 'shape', icon: Square, label: 'Formas' },
        { id: 'brush', icon: Paintbrush, label: 'Pincel' },
        { id: 'pencil', icon: Pencil, label: 'Lápiz' },
        { id: 'eraser', icon: Eraser, label: 'Borrador' },
        { id: 'fill', icon: Droplet, label: 'Rellenar' },
        { id: 'sprite', icon: ImageIcon, label: 'Sprite' },
    ];

    const shapes = [
        { id: 'rectangle', icon: Square, label: 'Rectángulo' },
        { id: 'circle', icon: Circle, label: 'Círculo' },
        { id: 'triangle', icon: Triangle, label: 'Triángulo' },
        { id: 'star', icon: Star, label: 'Estrella' },
    ];

    return (
        <div className="tools-container">
            {tools.map((tool) => (
                <Button
                    key={tool.id}
                    variant={currentTool === tool.id ? "default" : "ghost"}
                    size="sm"
                    className="tool-button"
                    onClick={() => onToolChange(tool.id)}
                >
                    <tool.icon className="h-4 w-4" />
                    {tool.label}
                </Button>
            ))}
            {currentTool === 'shape' && (
                <div className="shapes-container">
                    {shapes.map((shape) => (
                        <Button
                            key={shape.id}
                            variant={currentShape === shape.id ? "default" : "ghost"}
                            size="sm"
                            className="tool-button"
                            onClick={() => onShapeChange(shape.id)}
                        >
                            <shape.icon className="h-4 w-4" />
                            {shape.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}