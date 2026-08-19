import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import PageHeader from '@/components/public/PageHeader';
import { getActiveMinistries } from '@/lib/queries/public';
import { imageUrlForDisplay, stripHtml } from '@/lib/utils/media';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ministries - CrossLife Mission Network',
  description: 'Explore the various ministries of CrossLife Mission Network.',
};

export default async function MinistriesPage() {
  const ministries = await getActiveMinistries();

  return (
    <PublicLayout>
      <PageHeader
        title="Our Ministries"
        subtitle="Discover the various ministries working together to manifest Sons of God"
        background="/assets/img/community.png"
      />
      <section id="ministries" className="ministries section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {ministries.length === 0 ? (
            <div className="text-center py-5">
              <p className="lead text-muted">No ministries are currently listed.</p>
            </div>
          ) : (
            <div className="row g-4">
              {ministries.map((ministry, index) => {
                const img = ministry.image_url
                  ? imageUrlForDisplay(ministry.image_url)
                  : '/assets/img/community.png';
                return (
                  <div
                    key={ministry.id}
                    className="col-lg-4 col-md-6"
                    data-aos="fade-up"
                    data-aos-delay={150 + index * 50}
                    id={`ministry-${ministry.id}`}
                  >
                    <div className="service-card h-100">
                      <div className="service-image">
                        <img src={img} alt={ministry.name} className="img-fluid" loading="lazy" />
                      </div>
                      <div className="service-content">
                        <h3>{ministry.name}</h3>
                        {ministry.leader_name && (
                          <p className="service-leader">
                            <i className="bi bi-person me-1"></i>
                            {ministry.leader_name}
                          </p>
                        )}
                        {ministry.description && (
                          <p>{stripHtml(ministry.description).slice(0, 200)}</p>
                        )}
                      </div>
                    </div>
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
