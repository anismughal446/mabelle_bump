"use client";

import { useState } from "react";
import ProductCard, { ProductSummary } from "@/components/ProductCard";
import { Spinner } from "@/components/Skeleton";

const QUESTIONS = [
  {
    key: "trimester",
    q: "Where are you in your journey?",
    options: [
      ["1st", "1st Trimester"],
      ["2nd", "2nd Trimester"],
      ["3rd", "3rd Trimester"],
      ["postpartum", "Postpartum / Nursing"],
    ],
  },
  {
    key: "occasion",
    q: "What do you need most right now?",
    options: [
      ["everyday", "Everyday essentials"],
      ["workwear", "Polished workwear"],
      ["loungewear", "Cozy loungewear"],
      ["occasion", "Something special"],
    ],
  },
  {
    key: "budget",
    q: "What's your budget per piece?",
    options: [
      ["value", "Under $50"],
      ["mid", "$50 – $90"],
      ["premium", "I'll invest in quality"],
    ],
  },
  {
    key: "nursing",
    q: "Will you want nursing-friendly styles?",
    options: [
      ["yes", "Yes, please"],
      ["no", "Not a priority"],
    ],
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductSummary[] | null>(null);

  function pick(key: string, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submit(next);
    }
  }

  async function submit(final: Record<string, string>) {
    setLoading(true);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trimester: final.trimester,
        occasion: final.occasion,
        budget: final.budget,
        nursing: final.nursing === "yes",
      }),
    });
    const d = await res.json();
    setResults(d.recommendations || []);
    setLoading(false);
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResults(null);
  }

  if (loading) return <Spinner />;

  if (results) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="text-center">
          <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-plum">Your capsule wardrobe</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-plum">Handpicked just for you</h1>
          <p className="mt-2 text-ink/60">Based on your answers, here are pieces we think you&apos;ll love.</p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <button onClick={restart} className="rounded-full border border-plum/30 px-6 py-3 text-sm font-semibold text-plum">
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  const current = QUESTIONS[step];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4 py-12">
      <div className="mb-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-blush">
          <div
            className="h-full rounded-full bg-terracotta transition-all"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Question {step + 1} of {QUESTIONS.length}
        </p>
      </div>

      <h1 className="font-display text-3xl font-bold text-plum">{current.q}</h1>
      <div className="mt-6 grid gap-3">
        {current.options.map(([value, label]) => (
          <button
            key={value}
            onClick={() => pick(current.key, value)}
            className="rounded-2xl border border-blush bg-white p-5 text-left text-lg font-medium text-ink transition hover:border-terracotta hover:bg-blush/20"
          >
            {label}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-6 text-sm text-terracotta hover:underline">
          ← Back
        </button>
      )}
    </div>
  );
}
