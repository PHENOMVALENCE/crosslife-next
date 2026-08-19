import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim();
  if (q.length < 2) {
    return NextResponse.json({ success: false, results: [] });
  }

  const searchTerm = `%${q}%`;
  const results: Array<{
    title: string;
    description: string;
    url: string;
    type: string;
    icon: string;
  }> = [];

  try {
    const sermons = await query<RowDataPacket[]>(
      `SELECT id, title, speaker, sermon_date FROM sermons
       WHERE status = 'published'
       AND (title LIKE ? OR speaker LIKE ? OR description LIKE ? OR category LIKE ?)
       ORDER BY sermon_date DESC LIMIT 5`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
    for (const s of sermons) {
      results.push({
        title: s.title as string,
        description: `Sermon by ${s.speaker || 'Unknown'}`,
        url: `/sermons#sermon-${s.id}`,
        type: 'Sermon',
        icon: 'play-circle',
      });
    }

    const events = await query<RowDataPacket[]>(
      `SELECT id, title, event_date, location FROM events
       WHERE status IN ('upcoming', 'ongoing')
       AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR event_type LIKE ?)
       ORDER BY event_date ASC LIMIT 5`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
    for (const e of events) {
      results.push({
        title: e.title as string,
        description: e.location ? `At ${e.location}` : '',
        url: `/events#event-${e.id}`,
        type: 'Event',
        icon: 'calendar-event',
      });
    }

    const ministries = await query<RowDataPacket[]>(
      `SELECT id, name, description FROM ministries
       WHERE status = 'active'
       AND (name LIKE ? OR description LIKE ? OR leader_name LIKE ?)
       ORDER BY display_order ASC LIMIT 5`,
      [searchTerm, searchTerm, searchTerm]
    );
    for (const m of ministries) {
      results.push({
        title: m.name as string,
        description: String(m.description || '').replace(/<[^>]*>/g, '').slice(0, 100),
        url: `/ministries#ministry-${m.id}`,
        type: 'Ministry',
        icon: 'people',
      });
    }

    const staticSections = [
      { title: 'Home', description: 'Welcome to CrossLife Mission Network', url: '/', type: 'Page', icon: 'house', keywords: 'home welcome' },
      { title: 'About Us', description: 'Learn about our mandate and mission', url: '/#about', type: 'Page', icon: 'info-circle', keywords: 'about mandate vision' },
      { title: 'Contact', description: 'Get in touch with us', url: '/contact', type: 'Page', icon: 'envelope', keywords: 'contact inquiry prayer' },
      { title: 'Giving', description: 'Support the ministry', url: '/#giving', type: 'Page', icon: 'heart', keywords: 'giving offering donation' },
    ];

    for (const section of staticSections) {
      const qLower = q.toLowerCase();
      if (
        section.title.toLowerCase().includes(qLower) ||
        section.description.toLowerCase().includes(qLower) ||
        section.keywords.toLowerCase().includes(qLower)
      ) {
        results.push({
          title: section.title,
          description: section.description,
          url: section.url,
          type: section.type,
          icon: section.icon,
        });
      }
    }

    results.sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
      const bMatch = b.title.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
      return bMatch - aMatch;
    });

    return NextResponse.json({ success: true, results: results.slice(0, 15) });
  } catch {
    return NextResponse.json({ success: false, error: 'Database error', results: [] });
  }
}
