import RepCounterForm from "@/components/RepCounterForm";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-50 to-zinc-100">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <RepCounterForm />
      </main>
    </div>
  );
}
