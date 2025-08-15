import type { Editor } from "@tiptap/react";

const FixedMenuComp = ({ editor }: { editor: Editor | null }) => {
  // 如果编辑器未准备好或没有选中内容，则不渲染气泡菜单
  if (!editor || !editor.isEditable) return null;

  return (
    <div className="flex h-16 w-full gap-0.5 rounded-lg border border-gray-200 bg-red-100 shadow-lg"></div>
  );
};

export default FixedMenuComp;
