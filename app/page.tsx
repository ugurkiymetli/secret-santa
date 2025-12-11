import { AuthForm } from "@/components/AuthForm"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="snow-bg" />
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex">
        <AuthForm />
      </div>
    </main>
  )
}
