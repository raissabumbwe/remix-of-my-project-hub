import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Quote, Highlighter, Link as LinkIcon, Undo, Redo,
  Type, Palette, ChevronDown,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuButton = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
    }`}
  >
    {children}
  </button>
);

const FONT_FAMILIES = [
  { label: "Par défaut", value: "" },
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
  { label: "Courier New", value: "Courier New" },
  { label: "Trebuchet MS", value: "Trebuchet MS" },
  { label: "Comic Sans MS", value: "Comic Sans MS" },
  { label: "Impact", value: "Impact" },
];

const FONT_SIZES = [
  { label: "Petit", value: "12px" },
  { label: "Normal", value: "16px" },
  { label: "Moyen", value: "18px" },
  { label: "Grand", value: "22px" },
  { label: "Très grand", value: "28px" },
  { label: "Énorme", value: "36px" },
];

const TEXT_COLORS = [
  "#000000", "#333333", "#666666", "#999999",
  "#DC2626", "#EA580C", "#D97706", "#CA8A04",
  "#16A34A", "#059669", "#0891B2", "#2563EB",
  "#7C3AED", "#9333EA", "#DB2777", "#E11D48",
  "#FFFFFF", "#F3F4F6", "#FEE2E2", "#FEF3C7",
  "#DCFCE7", "#CFFAFE", "#DBEAFE", "#EDE9FE",
];

const FontSizeExtension = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      FontSizeExtension,
      Color,
      FontFamily,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL du lien :");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
    setShowSizeMenu(false);
  };

  const setFont = (font: string) => {
    if (font) {
      editor.chain().focus().setFontFamily(font).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
    setShowFontMenu(false);
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-secondary">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-border bg-card items-center">
        {/* Font Family */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowFontMenu(!showFontMenu); setShowSizeMenu(false); setShowColorPicker(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-secondary transition-colors"
            title="Police"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline max-w-[80px] truncate">Police</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontMenu && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[160px] py-1 max-h-[200px] overflow-y-auto">
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f.value || "default"}
                  type="button"
                  onClick={() => setFont(f.value)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                  style={{ fontFamily: f.value || "inherit" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowSizeMenu(!showSizeMenu); setShowFontMenu(false); setShowColorPicker(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-secondary transition-colors"
            title="Taille"
          >
            <span className="text-[10px] font-bold">A</span><span className="text-[14px] font-bold">A</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[130px] py-1">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFontSize(s.value)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowColorPicker(!showColorPicker); setShowFontMenu(false); setShowSizeMenu(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-secondary transition-colors"
            title="Couleur"
          >
            <Palette className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 p-2 w-[180px]">
              <div className="grid grid-cols-8 gap-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-5 h-5 rounded-sm border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-border mx-1 h-6" />

        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras">
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique">
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Souligné">
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré">
          <Strikethrough className="w-4 h-4" />
        </MenuButton>

        <div className="w-px bg-border mx-1 h-6" />

        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Titre 1">
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titre 2">
          <Heading2 className="w-4 h-4" />
        </MenuButton>

        <div className="w-px bg-border mx-1 h-6" />

        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citation">
          <Quote className="w-4 h-4" />
        </MenuButton>

        <div className="w-px bg-border mx-1 h-6" />

        <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Aligner à gauche">
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centrer">
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Aligner à droite">
          <AlignRight className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justifier">
          <AlignJustify className="w-4 h-4" />
        </MenuButton>

        <div className="w-px bg-border mx-1 h-6" />

        <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Surligner">
          <Highlighter className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={addLink} active={editor.isActive("link")} title="Lien">
          <LinkIcon className="w-4 h-4" />
        </MenuButton>

        <div className="w-px bg-border mx-1 h-6" />

        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[150px] text-foreground focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[130px]"
      />
    </div>
  );
};

export default RichTextEditor;
