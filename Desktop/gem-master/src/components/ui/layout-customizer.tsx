'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Eye, EyeOff, Layout } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface LayoutSection {
    id: string;
    label: string;
    enabled: boolean;
    order: number;
}

export interface LayoutConfig {
    sections: LayoutSection[];
    show_store_name: boolean;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
    sections: [
        { id: 'highlights', label: 'Highlights Bar', enabled: true, order: 0 },
        { id: 'store_name', label: 'Store Name', enabled: true, order: 1 },
        { id: 'product_name', label: 'Product Name', enabled: true, order: 2 },
        { id: 'price', label: 'Price', enabled: true, order: 3 },
        { id: 'gallery', label: 'Image Gallery', enabled: true, order: 4 },
        { id: 'lead_form', label: 'Lead Form', enabled: true, order: 5 },
        { id: 'description', label: 'Description', enabled: true, order: 6 },
        { id: 'footer', label: 'Footer', enabled: true, order: 7 },
    ],
    show_store_name: true,
};

interface SortableLayoutItemProps {
    section: LayoutSection;
    onToggle: (id: string) => void;
}

function SortableLayoutItem({ section, onToggle }: SortableLayoutItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${section.enabled
                ? 'bg-white border-gray-200'
                : 'bg-gray-50 border-gray-100 opacity-60'
                } ${isDragging ? 'shadow-lg ring-2 ring-orange-500 z-10' : ''}`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
            <span className="flex-1 font-medium text-sm select-none">{section.label}</span>
            <button
                type="button"
                onClick={() => onToggle(section.id)}
                className={`p-1.5 rounded-lg transition-colors ${section.enabled
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-200 text-gray-400'
                    }`}
            >
                {section.enabled ? (
                    <Eye className="w-4 h-4" />
                ) : (
                    <EyeOff className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}

interface LayoutCustomizerProps {
    value: LayoutConfig;
    onChange: (config: LayoutConfig) => void;
}

export function LayoutCustomizer({ value, onChange }: LayoutCustomizerProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleToggleSection = (id: string) => {
        const newSections = value.sections.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
        );
        onChange({ ...value, sections: newSections });
    };

    const handleToggleStoreName = () => {
        onChange({ ...value, show_store_name: !value.show_store_name });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = value.sections.findIndex((s) => s.id === active.id);
            const newIndex = value.sections.findIndex((s) => s.id === over.id);

            const newSections = arrayMove(value.sections, oldIndex, newIndex);

            // Update order numbers
            const reorderedSections = newSections.map((s, i) => ({ ...s, order: i }));

            onChange({ ...value, sections: reorderedSections });
        }
    };

    const sortedSections = [...value.sections]
        .map(section => ({
            ...section,
            label: section.label || DEFAULT_LAYOUT.sections.find(s => s.id === section.id)?.label || section.id
        }))
        .sort((a, b) => a.order - b.order);

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Layout className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Page Layout</CardTitle>
                        <p className="text-sm text-gray-500">Drag to reorder, toggle to show/hide</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedSections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {sortedSections.map((section) => (
                                <SortableLayoutItem
                                    key={section.id}
                                    section={section}
                                    onToggle={handleToggleSection}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <div className="pt-3 mt-3 border-t">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="show-store-name" className="text-sm font-medium">
                            Show store name on product page
                        </Label>
                        <Switch
                            id="show-store-name"
                            checked={value.show_store_name}
                            onCheckedChange={handleToggleStoreName}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
