'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type Question = {
  id: number;
  question_text: string;
  options: Array<{ id: number; option_text: string }>;
};

export default function QuizForm({
  moduleId,
  enrollmentId,
  questions,
  passMark,
}: {
  moduleId: number;
  enrollmentId: number;
  questions: Question[];
  passMark: number;
}) {
  const router = useRouter();
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const answers: Record<string, number> = {};
    questions.forEach((q) => {
      answers[`q_${q.id}`] = Number(form.get(`q_${q.id}`));
    });

    const res = await fetch('/api/student/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, enrollmentId, answers }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setResult({ score: data.scorePct, passed: data.passed });
      router.refresh();
    } else {
      alert(data.message || 'Submission failed');
    }
  }

  if (result) {
    return (
      <div className={`alert alert-${result.passed ? 'success' : 'warning'}`}>
        <h4>{result.passed ? 'Congratulations!' : 'Keep studying'}</h4>
        <p>
          Score: {result.score}% (Pass mark: {passMark}%)
        </p>
        <Link href={`/student/program/${enrollmentId}`} className="btn btn-primary">
          Back to program
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return <p className="text-muted">No questions configured for this module yet.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((q, i) => (
        <div key={q.id} className="card mb-3">
          <div className="card-body">
            <p className="fw-semibold">
              {i + 1}. {q.question_text}
            </p>
            {q.options.map((o) => (
              <div className="form-check" key={o.id}>
                <input className="form-check-input" type="radio" name={`q_${q.id}`} id={`q_${q.id}_${o.id}`} value={o.id} required />
                <label className="form-check-label" htmlFor={`q_${q.id}_${o.id}`}>
                  {o.option_text}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" className="btn btn-success" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Assessment'}
      </button>
    </form>
  );
}
