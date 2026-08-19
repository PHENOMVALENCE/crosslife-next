import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import PageHeader from '@/components/public/PageHeader';
import { getActiveGalleryAlbums } from '@/lib/queries/public';
import { imageUrlForDisplay } from '@/lib/utils/media';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gallery - CrossLife Mission Network',
  description: 'CrossLife service gallery — we capture every moment.',
};

const defaultCover = '/assets/img/melchezed order.jpeg';

export default async function GalleryPage() {
  const albums = await getActiveGalleryAlbums();

  return (
    <PublicLayout>
      <PageHeader
        title="Gallery"
        subtitle="Moments from our services and community life"
        background="/assets/img/_MG_5282.jpg"
      />
      <section id="gallery" className="portfolio section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {albums.length === 0 ? (
            <div className="text-center py-5">
              <p className="lead text-muted">No gallery albums available yet.</p>
            </div>
          ) : (
            <div className="row gy-4">
              {albums.map((album, index) => {
                const cover = album.cover_image
                  ? imageUrlForDisplay(album.cover_image)
                  : defaultCover;
                return (
                  <div
                    key={`${album.title}-${index}`}
                    className="col-lg-4 col-md-6"
                    data-aos="fade-up"
                    data-aos-delay={150 + index * 50}
                  >
                    <div className="portfolio-item h-100">
                      <div className="portfolio-content">
                        <img src={cover} alt={album.title} className="img-fluid" loading="lazy" />
                        <div className="portfolio-info">
                          <h4>{album.title}</h4>
                          {album.description && <p>{album.description}</p>}
                          {album.google_photos_url && (
                            <a
                              href={album.google_photos_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="details-link"
                            >
                              View Album <i className="bi bi-arrow-right"></i>
                            </a>
                          )}
                        </div>
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
