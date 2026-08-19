import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import PageHeader from '@/components/public/PageHeader';
import { getActiveLeadership } from '@/lib/queries/public';
import { imageUrlForDisplay } from '@/lib/utils/media';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leadership - CrossLife Mission Network',
  description: 'Meet the leadership team of CrossLife Mission Network.',
};

const placeholder = '/assets/img/_MG_4880.jpg';

export default async function LeadershipPage() {
  const leaders = await getActiveLeadership();

  return (
    <PublicLayout>
      <PageHeader
        title="Our Leadership"
        subtitle="The team guiding CrossLife Mission Network and serving the body of Christ"
        background="/assets/img/_MG_4859.jpg"
      />
      <section id="leadership" className="leadership section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {leaders.length === 0 ? (
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center py-5">
                <p className="lead text-muted">
                  No leadership profiles are currently listed. Content is managed from Cross Admin.
                </p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {leaders.map((leader, index) => {
                const imgSrc = leader.image_url
                  ? imageUrlForDisplay(leader.image_url)
                  : placeholder;
                const departments = (leader.departments || '')
                  .split(',')
                  .map((d) => d.trim())
                  .filter(Boolean);

                return (
                  <div
                    key={leader.id}
                    className="col-lg-4 col-md-6"
                    data-aos="fade-up"
                    data-aos-delay={150 + index * 50}
                  >
                    <article className="leader-card">
                      <div className="leader-card__image">
                        <img src={imgSrc} alt={leader.name} loading="lazy" />
                      </div>
                      <div className="leader-card__body">
                        <h3 className="leader-card__name">{leader.name}</h3>
                        <p className="leader-card__role">{leader.role}</p>
                        {departments.length > 0 && (
                          <div className="leader-card__departments" aria-label="Departments">
                            {departments.map((dept) => (
                              <span key={dept} className="tag">
                                {dept}
                              </span>
                            ))}
                          </div>
                        )}
                        {leader.bio && <p className="leader-card__bio">{leader.bio}</p>}
                        {(leader.email || leader.phone) && (
                          <div className="leader-card__contact">
                            {leader.email && (
                              <a href={`mailto:${leader.email}`} className="contact-item">
                                <i className="bi bi-envelope-fill"></i>
                                <span>Email</span>
                              </a>
                            )}
                            {leader.phone && (
                              <a href={`tel:${leader.phone}`} className="contact-item">
                                <i className="bi bi-telephone-fill"></i>
                                <span>{leader.phone}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
