'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Palette,
    Undo,
    Redo,
    Code,
    Upload,
    Loader2,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const colors = [
    '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
];

interface MenuBarProps {
    editor: Editor | null;
    userId?: string;
}

function MenuBar({ editor, userId }: MenuBarProps) {
    const [linkUrl, setLinkUrl] = useState('');
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [libraryImages, setLibraryImages] = useState<Array<{ name: string; url: string }>>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadLibrary = useCallback(async () => {
        if (!userId) return;
        setIsLoadingLibrary(true);
        const supabase = createClient();

        try {
            const { data, error } = await supabase.storage
                .from('product-media')
                .list(userId, {
                    limit: 50,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) throw error;

            if (data) {
                // Filter for images only
                const images = data
                    .filter(file => file.metadata?.mimetype?.startsWith('image/'))
                    .map(file => {
                        const { data: { publicUrl } } = supabase.storage
                            .from('product-media')
                            .getPublicUrl(`${userId}/${file.name}`);
                        return {
                            name: file.name,
                            url: publicUrl
                        };
                    });
                setLibraryImages(images);
            }
        } catch (error) {
            console.error('Error loading library:', error);
            toast.error('Failed to load image library');
        } finally {
            setIsLoadingLibrary(false);
        }
    }, [userId]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !userId) return;

        setIsUploading(true);
        const file = files[0];
        const supabase = createClient();

        try {
            // Validate file size (20MB max)
            if (file.size > 20 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Max size is 20MB.`);
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

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

            editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
            setIsImageDialogOpen(false);
            toast.success('Image uploaded successfully');

            // Refresh library
            loadLibrary();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleInsertUrl = () => {
        if (imageUrl) {
            editor?.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
            setIsImageDialogOpen(false);
        }
    };

    const handleSelectFromLibrary = (url: string) => {
        editor?.chain().focus().setImage({ src: url }).run();
        setIsImageDialogOpen(false);
    };

    const addLink = useCallback(() => {
        if (linkUrl) {
            editor?.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
        }
    }, [editor, linkUrl]);

    if (!editor) return null;



    const MenuButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "p-2 rounded-lg transition-colors",
                isActive
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            {/* Heading/Paragraph selector */}
            <Select
                value={
                    editor.isActive('heading', { level: 1 }) ? 'h1' :
                        editor.isActive('heading', { level: 2 }) ? 'h2' :
                            editor.isActive('heading', { level: 3 }) ? 'h3' :
                                'p'
                }
                onValueChange={(value) => {
                    if (value === 'p') {
                        editor.chain().focus().setParagraph().run();
                    } else {
                        const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
                        editor.chain().focus().toggleHeading({ level }).run();
                    }
                }}
            >
                <SelectTrigger className="w-[120px] h-9 bg-white border-gray-200">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="p">Paragraph</SelectItem>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                    <SelectItem value="h3">Heading 3</SelectItem>
                </SelectContent>
            </Select>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Text formatting */}
            <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
            >
                <UnderlineIcon className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Color picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1"
                        title="Text Color"
                    >
                        <Palette className="w-4 h-4" />
                        <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{
                                backgroundColor: editor.getAttributes('textStyle').color || '#000000'
                            }}
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-5 gap-1">
                        {colors.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => editor.chain().focus().setColor(color).run()}
                                className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().unsetColor().run()}
                        className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Reset color
                    </button>
                </PopoverContent>
            </Popover>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Alignment */}
            <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
            >
                <AlignLeft className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
            >
                <AlignCenter className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
            >
                <AlignRight className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </MenuButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Link */}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            editor.isActive('link')
                                ? "bg-gray-200 text-gray-900"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                        title="Add Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Add Link</p>
                        <Input
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addLink()}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={addLink} className="flex-1">
                                Add Link
                            </Button>
                            {editor.isActive('link') && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => editor.chain().focus().unsetLink().run()}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Image Dialog */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        title="Add Image"
                        onClick={() => {
                            setIsImageDialogOpen(true);
                            if (userId) loadLibrary();
                        }}
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                            <TabsTrigger value="library">Library</TabsTrigger>
                            <TabsTrigger value="url">From URL</TabsTrigger>
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
                                    accept="image/*"
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
                                        <p className="font-medium text-gray-900">Drop image here or click to browse</p>
                                        <p className="text-sm text-gray-500">Max size 20MB</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="library" className="space-y-4 pt-4">
                            {isLoadingLibrary ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                </div>
                            ) : libraryImages.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-1">
                                    {libraryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectFromLibrary(img.url);
                                            }}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 group"
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p>No images found in library</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="url" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleInsertUrl()}
                                />
                                <Button onClick={handleInsertUrl} className="w-full" disabled={!imageUrl}>
                                    Insert Image
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Code */}
            <MenuButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
            >
                <Code className="w-4 h-4" />
            </MenuButton>

            <div className="flex-1" />

            {/* Undo/Redo */}
            <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </MenuButton>
        </div>
    );
}

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    userId?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Start typing...', userId }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 underline hover:text-indigo-700',
                },
            }),
            TextStyle,
            Color,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full rounded-lg my-4',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none',
            },
        },
    });

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <MenuBar editor={editor} userId={userId} />
            <EditorContent editor={editor} />
        </div>
    );
}
