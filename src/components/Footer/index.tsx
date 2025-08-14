import Link from 'next/link'
import { MingcuteGithubLine } from '@/styles/svg'

const Footer = () => {
  return (
    <div className="w-full h-10 py-1 flex justify-center items-center gap-2">
      <Link
        href="https://github.com/starry-sky-studio/tp-edit"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub 仓库"
      >
        <MingcuteGithubLine />
      </Link>
    </div>
  )
}

export default Footer
