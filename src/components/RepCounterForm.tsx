"use client";

import { useMemo, useState } from "react";
import {
  type Backend,
  type CountRepsResponse,
  type Exercise,
  EXERCISES,
  countReps,
  fileToBase64,
} from "@/lib/api";

const EXERCISE_LABELS: Record<Exercise, string> = {
  pushup: "Push-up",
  squat: "Squat",
  situp: "Sit-up",
};

export default function RepCounterForm() {
  const [file, setFile] = useState<File | null>(null);
  const [exercise, setExercise] = useState<Exercise>("pushup");
  const [backend, setBackend] = useState<Backend>("tflite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CountRepsResponse | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Please select a video file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const videoBase64 = await fileToBase64(file);
      const data = await countReps(videoBase64, exercise, backend);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-600">
          Pose &amp; Rep Counting
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
          FitVision
        </h1>
        <p className="mt-3 text-zinc-600">
          Upload a workout video, pick an exercise, and get an annotated clip
          with rep counts.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="video"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Workout video
            </label>
            <input
              id="video"
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
              className="block w-full cursor-pointer rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-700"
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null;
                setFile(selected);
                setResult(null);
                setError(null);
              }}
            />
            {previewUrl && (
              <video
                src={previewUrl}
                controls
                className="mt-4 w-full rounded-lg border border-zinc-200 bg-black"
              />
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="exercise"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Exercise
              </label>
              <select
                id="exercise"
                value={exercise}
                onChange={(e) => setExercise(e.target.value as Exercise)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {EXERCISES.map((key) => (
                  <option key={key} value={key}>
                    {EXERCISE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-zinc-700">
                Processing backend
              </legend>
              <div className="flex flex-col gap-2 sm:flex-row">
                {(
                  [
                    ["tflite", "TFLite"],
                    ["mediapipe", "MediaPipe"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      backend === value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="backend"
                      value={value}
                      checked={backend === value}
                      onChange={() => setBackend(value)}
                      className="accent-emerald-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing video…" : "Count reps"}
          </button>
        </div>
      </form>

      {result && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">Total reps</p>
              <p className="text-4xl font-bold text-emerald-700">{result.reps}</p>
            </div>
            <div className="text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-800">Exercise:</span>{" "}
                {EXERCISE_LABELS[result.exercise as Exercise] ?? result.exercise}
              </p>
              <p className="mt-1">
                <span className="font-medium text-zinc-800">Backend:</span>{" "}
                {result.backend}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-zinc-700">
              Annotated output
            </h2>
            <video
              src={`data:video/mp4;base64,${result.video}`}
              controls
              className="w-full rounded-lg border border-emerald-200 bg-black"
            />
          </div>
        </section>
      )}
    </div>
  );
}
