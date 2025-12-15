import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center py-4 px-6 backdrop-blur-md bg-black/40 border-t border-white/20">
      <div className="flex items-center gap-6">
        <a
          href="https://www.linkedin.com/in/ugurkiymetli"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
        >
          <Linkedin className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Need help?</span>
        </a>
        <a
          href="https://github.com/ugurkiymetli/secret-santa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
        >
          <Github className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Check the code!</span>
        </a>
      </div>
    </footer>
  );
}
