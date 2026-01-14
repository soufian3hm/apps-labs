'use client';

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Upload,
    Link as LinkIcon,
    X,
    Image as ImageIcon,
    Video,
    Loader2,
    GripVertical,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaItem {
    id?: string;
    url: string;
    alt?: string;
    type: 'image' | 'video';
}

interface MediaUploadProps {
    media: MediaItem[];
    onChange: (media: MediaItem[]) => void;
    userId: string;
}

export function MediaUpload({ media, onChange, userId }: MediaUploadProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const supabase = createClient();
        const newMedia: MediaItem[] = [];

        for (const file of Array.from(files)) {
            // Validate file size (20MB max)
            if (file.size > 20 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Max size is 20MB.`);
                continue;
            }

            // Validate file type
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) {
                toast.error(`${file.name} is not a supported format.`);
                continue;
            }

            try {
                const fileName = `${userId}/${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage
                    .from('product-media')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (error) throw error;

                const { data: urlData } = supabase.storage
                    .from('product-media')
                    .getPublicUrl(data.path);

                newMedia.push({
                    url: urlData.publicUrl,
                    alt: file.name,
                    type: isImage ? 'image' : 'video',
                });
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        if (newMedia.length > 0) {
            onChange([...media, ...newMedia]);
            toast.success(`${newMedia.length} file(s) uploaded successfully`);
        }

        setIsUploading(false);
        setIsDialogOpen(false);
    }, [media, onChange, userId]);

    const handleUrlAdd = useCallback(() => {
        if (!urlInput.trim()) return;

        // Detect if it's an image or video URL
        const isVideo = /\.(mp4|webm|mov|ogg)$/i.test(urlInput) ||
            urlInput.includes('youtube.com') ||
            urlInput.includes('vimeo.com');

        const newItem: MediaItem = {
            url: urlInput.trim(),
            alt: 'Pasted media',
            type: isVideo ? 'video' : 'image',
        };

        onChange([...media, newItem]);
        setUrlInput('');
        setIsDialogOpen(false);
        toast.success('Media added successfully');
    }, [urlInput, media, onChange]);

    const handleRemove = useCallback((index: number) => {
        const newMedia = media.filter((_, i) => i !== index);
        onChange(newMedia);
    }, [media, onChange]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newMedia = [...media];
        const [draggedItem] = newMedia.splice(draggedIndex, 1);
        newMedia.splice(index, 0, draggedItem);
        onChange(newMedia);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-4">
            {/* Media Grid */}
            {media.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {media.map((item, index) => (
                        <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${draggedIndex === index
                                    ? 'border-indigo-500 opacity-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {item.type === 'image' ? (
                                <img
                                    src={item.url}
                                    alt={item.alt || ''}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Video className="w-8 h-8 text-gray-400" />
                                </div>
                            )}

                            {/* Drag handle & actions overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    className="p-2 bg-white rounded-lg cursor-grab active:cursor-grabbing"
                                >
                                    <GripVertical className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* First item badge */}
                            {index === 0 && (
                                <span className="absolute top-2 left-2 px-2 py-1 bg-indigo-500 text-white text-xs rounded-md">
                                    Main
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Upload new
                        </Button>
                        <Button type="button" variant="ghost" className="gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Paste URL
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Accepts images, videos. Max 20MB each.
                    </p>
                </div>
            </div>

            {/* Upload Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Media</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload Files</TabsTrigger>
                            <TabsTrigger value="url">Paste URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="space-y-4 pt-4">
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleFileUpload(e.dataTransfer.files);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                    className="hidden"
                                />
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        <p className="text-sm text-gray-600">Uploading...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <p className="font-medium text-gray-900">Drop files here or click to browse</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, GIF, MP4, WebM up to 20MB</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="url" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="https://example.com/image.jpg"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
                                />
                                <p className="text-xs text-gray-500">
                                    Paste an image or video URL. The URL will be embedded directly.
                                </p>
                            </div>
                            <Button onClick={handleUrlAdd} className="w-full" disabled={!urlInput.trim()}>
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Add Media
                            </Button>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}
