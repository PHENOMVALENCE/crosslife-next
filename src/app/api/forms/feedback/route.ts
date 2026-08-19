import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { sanitize } from '@/lib/utils/media';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = sanitize(body.name || 'Anonymous');
    const email = sanitize(body.email || '');
    const feedbackType = sanitize(body.feedback_type || 'other');
    const message = sanitize(body.message || '');

    if (!message) {
      return NextResponse.json({ success: false, message: 'Please enter your feedback.' }, { status: 400 });
    }

    await execute(
      "INSERT INTO feedback (name, email, feedback_type, message, status) VALUES (?, ?, ?, ?, 'new')",
      [name || 'Anonymous', email, feedbackType, message]
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.',
    });
  } catch (error) {
    console.error('Feedback form error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    );
  }
}
