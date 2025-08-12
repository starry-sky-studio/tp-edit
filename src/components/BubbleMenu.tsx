import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'

const BubbleMenuComp = ({ editor }: { editor: Editor | null }) => {
  // 如果编辑器未准备好或没有选中内容，则不渲染气泡菜单
  if (!editor || !editor.isEditable) return null

  return (
    <BubbleMenu
      editor={editor}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex gap-0.5"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''
        }`}
        type="button"
        title="Bold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 5h6a4 4 0 0 1 0 8H7z"></path>
          <path d="M7 12h7a4 4 0 0 1 0 8H7z"></path>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''
        }`}
        type="button"
        title="Italic"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line
            x1="19"
            y1="4"
            x2="10"
            y2="4"
          ></line>
          <line
            x1="14"
            y1="20"
            x2="5"
            y2="20"
          ></line>
          <line
            x1="15"
            y1="4"
            x2="9"
            y2="20"
          ></line>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''
        }`}
        type="button"
        title="Strikethrough"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16 4H9l3 5m0 6H8m8 4H8m8-8H8M3 12h18"></path>
        </svg>
      </button>

      <div className="w-px bg-gray-200 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : ''
        }`}
        type="button"
        title="Heading 1"
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : ''
        }`}
        type="button"
        title="Heading 2"
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''
        }`}
        type="button"
        title="Bullet List"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line
            x1="8"
            y1="6"
            x2="21"
            y2="6"
          ></line>
          <line
            x1="8"
            y1="12"
            x2="21"
            y2="12"
          ></line>
          <line
            x1="8"
            y1="18"
            x2="21"
            y2="18"
          ></line>
          <line
            x1="3"
            y1="6"
            x2="3.01"
            y2="6"
          ></line>
          <line
            x1="3"
            y1="12"
            x2="3.01"
            y2="12"
          ></line>
          <line
            x1="3"
            y1="18"
            x2="3.01"
            y2="18"
          ></line>
        </svg>
      </button>
    </BubbleMenu>
  )
}

export default BubbleMenuComp
