'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BubbleMenu from './menus/BubbleMenu'
import { useEffect, useState } from 'react'
import { HeadingButton } from './ui/tiptap-ui/heading-button'
import FixedMenuComp from './menus/FixedMenu'
import Footer from './Footer'
import { Placeholder } from '@tiptap/extensions'

const Tiptap = () => {
  const [mounted, setMounted] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        codeBlock: false
      }),
      Placeholder.configure({
        placeholder: '开始输入内容...',
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0'
      })
    ],
    content: '<p>Hello World! 🌎️</p>',
    editorProps: {
      attributes: {
        class:
          'prose w-[1200px] h-[clca(100vh-104px)]  prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 min-h-[300px] bg-white border border-gray-300 rounded-lg focus:outline-none'
      }
    },
    autofocus: true,
    editable: true,
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    injectCSS: true // 注入默认样式（推荐保持true）
  })

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted)
    return (
      <div className="min-h-[300px] bg-white border border-gray-300 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )

  return (
    <div className="relative w-[1200px] h-screen bg-white">
      <FixedMenuComp editor={editor} />
      {editor && <BubbleMenu editor={editor} />}

      <EditorContent editor={editor} />

      <Footer />
    </div>
  )
}

export default Tiptap
