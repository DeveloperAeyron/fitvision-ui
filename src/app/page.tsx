import RepCounterForm from "@/components/RepCounterForm";

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />
      <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <RepCounterForm />
      </main>
    </div>
  );
}
