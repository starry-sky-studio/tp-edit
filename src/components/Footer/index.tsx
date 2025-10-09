import Link from "next/link";
import { MingcuteGithubLine } from "@/styles/svg";

const Footer = () => {
	return (
		<div className="flex h-6 w-full items-center justify-center gap-2 ">
			<Link
				href="https://github.com/starry-sky-studio/tp-edit"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub 仓库"
			>
				<MingcuteGithubLine />
			</Link>
		</div>
	);
};

export default Footer;
