import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { isDiscipleshipAdmin, CONTENT_ROLES } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/require-admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  if (isDiscipleshipAdmin(session)) {
    redirect('/admin/discipleship');
  }
  await requireAdmin(CONTENT_ROLES);

  const stats = {
    sermons: 0,
    events: 0,
    contacts: 0,
    prayers: 0,
    feedback: 0,
    students: 0,
  };

  try {
    const [[sermons], [events], [contacts], [prayers], [feedback], [students]] = await Promise.all([
      query<RowDataPacket[]>('SELECT COUNT(*) as c FROM sermons'),
      query<RowDataPacket[]>('SELECT COUNT(*) as c FROM events'),
      query<RowDataPacket[]>("SELECT COUNT(*) as c FROM contact_inquiries WHERE status = 'new'"),
      query<RowDataPacket[]>("SELECT COUNT(*) as c FROM prayer_requests WHERE status = 'new'"),
      query<RowDataPacket[]>("SELECT COUNT(*) as c FROM feedback WHERE status = 'new'"),
      query<RowDataPacket[]>("SELECT COUNT(*) as c FROM discipleship_students WHERE status = 'pending'"),
    ]);
    stats.sermons = Number(sermons?.c || 0);
    stats.events = Number(events?.c || 0);
    stats.contacts = Number(contacts?.c || 0);
    stats.prayers = Number(prayers?.c || 0);
    stats.feedback = Number(feedback?.c || 0);
    stats.students = Number(students?.c || 0);
  } catch {
    /* DB unavailable */
  }

  const cards = [
    { label: 'Sermons', value: stats.sermons, href: '/admin/sermons' },
    { label: 'Events', value: stats.events, href: '/admin/events' },
    { label: 'New Contacts', value: stats.contacts, href: '/admin/contacts' },
    { label: 'New Prayers', value: stats.prayers, href: '/admin/prayer-requests' },
    { label: 'New Feedback', value: stats.feedback, href: '/admin/feedback' },
    { label: 'Pending Students', value: stats.students, href: '/admin/students' },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${session.adminName || session.adminUsername}. Overview of your ministry platform.`}
      />
      <div className="row g-3">
        {cards.map((card) => (
          <div key={card.label} className="col-md-4 col-lg-2">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="text-muted">{card.label}</h6>
                <p className="display-6 mb-2">{card.value}</p>
                <Link href={card.href} className="stretched-link small">
                  Manage →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
