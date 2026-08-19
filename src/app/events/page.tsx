import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import PageHeader from '@/components/public/PageHeader';
import { getPublicEvents } from '@/lib/queries/public';
import { imageUrlForDisplay } from '@/lib/utils/media';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Events - CrossLife Mission Network',
  description: 'Join us for upcoming services, programs, and special events.',
};

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <PublicLayout>
      <PageHeader
        title="Upcoming Events"
        subtitle="Join us for our upcoming services, programs, and special events"
      />
      <section id="events" className="events section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4">
            {events.length === 0 ? (
              <div className="col-12 text-center">
                <p className="lead">No events scheduled at the moment. Please check back soon!</p>
              </div>
            ) : (
              events.map((event, index) => {
                const eventDate = new Date(event.event_date);
                const isPast =
                  event.status === 'completed' || event.event_date < new Date().toISOString().slice(0, 10);
                const imgUrl = event.image_url ? imageUrlForDisplay(event.image_url) : '';

                return (
                  <div
                    key={event.id}
                    className="col-lg-6"
                    data-aos="fade-up"
                    data-aos-delay={150 + index * 50}
                    id={`event-${event.id}`}
                  >
                    <div className="event-card">
                      <div className="event-date">
                        <span className="day">{eventDate.getDate()}</span>
                        <span className="month">
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="event-content">
                        <h3>{event.title}</h3>
                        {event.status && event.status !== 'upcoming' && (
                          <span className={`badge ${isPast ? 'bg-secondary' : 'bg-info'} mb-2`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        )}
                        <p className="event-time">
                          <i className="bi bi-calendar3 me-2"></i>
                          {eventDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {event.event_time && (
                            <>
                              <i className="bi bi-clock ms-2 me-2"></i>
                              {new Date(`1970-01-01T${event.event_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </>
                          )}
                        </p>
                        {event.location && (
                          <p className="event-location">
                            <i className="bi bi-geo-alt me-2"></i>
                            {event.location}
                          </p>
                        )}
                        {event.event_type && (
                          <span className="badge bg-primary mb-2">{event.event_type}</span>
                        )}
                        {event.description && <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>}
                        {imgUrl && (
                          <div className="event-image mt-3">
                            <img
                              src={imgUrl}
                              alt={event.title}
                              className="img-fluid rounded"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
