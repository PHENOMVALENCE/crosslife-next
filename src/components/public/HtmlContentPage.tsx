'use client';

import { useEffect } from 'react';

async function submitForm(formType: string, form: HTMLFormElement) {
  const formData = new FormData(form);
  const body: Record<string, string> = {};
  formData.forEach((value, key) => {
    body[key] = String(value);
  });

  const loading = form.querySelector('.loading') as HTMLElement | null;
  const errorEl = form.querySelector('.error-message') as HTMLElement | null;
  const sentEl = form.querySelector('.sent-message') as HTMLElement | null;

  loading?.style.setProperty('display', 'block');
  errorEl?.style.setProperty('display', 'none');
  sentEl?.style.setProperty('display', 'none');

  try {
    const res = await fetch(`/api/forms/${formType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    loading?.style.setProperty('display', 'none');
    if (data.success) {
      sentEl?.style.setProperty('display', 'block');
      if (data.message && sentEl) sentEl.textContent = data.message;
      form.reset();
    } else {
      errorEl?.style.setProperty('display', 'block');
      if (errorEl) errorEl.textContent = data.message || 'Something went wrong.';
    }
  } catch {
    loading?.style.setProperty('display', 'none');
    errorEl?.style.setProperty('display', 'block');
    if (errorEl) errorEl.textContent = 'Something went wrong. Please try again.';
  }
}

export default function HtmlContentPage({ html }: { html: string }) {
  useEffect(() => {
    document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
      const formType = form.getAttribute('data-form');
      if (!formType) return;
      const handler = (e: Event) => {
        e.preventDefault();
        submitForm(formType, form);
      };
      form.addEventListener('submit', handler);
      return () => form.removeEventListener('submit', handler);
    });
  }, [html]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
