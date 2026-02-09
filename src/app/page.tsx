import { Mail, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { LoginButton } from '@/components/auth/LoginButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <Mail className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Glider</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
          Stop climbing through your inbox.
          <br />
          <span className="text-blue-600">Start gliding.</span>
        </h1>
        <p className="mb-8 text-xl text-gray-600 md:text-2xl">
          AI-powered email assistant that extracts action items and recommends
          next steps, so you can focus on what matters.
        </p>
        <LoginButton />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              AI-Powered Analysis
            </h3>
            <p className="text-gray-600">
              Claude AI extracts action items, deadlines, and priorities from
              every email automatically.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Smart Recommendations
            </h3>
            <p className="text-gray-600">
              Get personalized suggestions: reply, schedule, delegate, or
              archive—based on email context.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Workflow First
            </h3>
            <p className="text-gray-600">
              See what needs your attention at a glance. No more scrolling
              through endless threads.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Built with Next.js, Claude AI, and Tailwind CSS</p>
      </footer>
    </main>
  );
}
