import { Button } from './ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './ui/popover';
import { Palette } from 'lucide-react';

export function ColorPicker({ color, onChange }) {
    const colors = [
        '#000000', '#808080', '#800000', '#FF0000',
        '#FFA500', '#FFFF00', '#008000', '#00FFFF',
        '#0000FF', '#800080', '#FFC0CB', '#FFFFFF'
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[150px] justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: color }} />
                        <Palette className="h-4 w-4" />
                    </div>
                    Editar colores
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="grid grid-cols-4 gap-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            className="w-32 h-24 rounded-full border-2" /* Aumentar el tamaño */
                            style={{ backgroundColor: c }}
                            onClick={() => onChange(c)} />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}