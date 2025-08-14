import type { Editor } from '@tiptap/react'

const FixedMenuComp = ({ editor }: { editor: Editor | null }) => {
  // 如果编辑器未准备好或没有选中内容，则不渲染气泡菜单
  if (!editor || !editor.isEditable) return null

  return (
    <div className="bg-white h-16 w-full border border-gray-200 rounded-lg shadow-lg p-1 flex gap-0.5"></div>
  )
}

export default FixedMenuComp
