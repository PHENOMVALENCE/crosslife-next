import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import PageHeader from '@/components/public/PageHeader';
import { getPublishedSermons } from '@/lib/queries/public';
import {
  formatSermonDate,
  getSpotifyEmbedUrl,
  getYouTubeId,
  imageUrlForDisplay,
} from '@/lib/utils/media';
import type { Sermon } from '@/lib/queries/public';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sermons & Teaching - CrossLife Mission Network',
  description: 'Access video and audio sermons from CrossLife Mission Network.',
};

function SermonCard({ sermon, delay }: { sermon: Sermon; delay: number }) {
  const youtubeId = getYouTubeId(sermon.youtube_url);
  const spotifyEmbed = getSpotifyEmbedUrl(sermon.spotify_url);
  const isVideo = sermon.sermon_type === 'video';
  const isPdf = sermon.sermon_type === 'pdf';
  const pdfUrl = sermon.pdf_url ? imageUrlForDisplay(sermon.pdf_url) : '';
  const dateStr = formatSermonDate(sermon.sermon_date);
  let thumbnail = '';
  if (sermon.thumbnail_url) thumbnail = imageUrlForDisplay(sermon.thumbnail_url);
  else if (youtubeId) thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  return (
    <div className="col-lg-6 col-xl-4" data-aos="fade-up" data-aos-delay={delay} id={`sermon-${sermon.id}`}>
      <div className="card sermon-card h-100 shadow-sm">
        {isVideo && youtubeId ? (
          <div className="sermon-video-wrapper">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={sermon.title}
            ></iframe>
          </div>
        ) : thumbnail ? (
          <div style={{ position: 'relative' }}>
            <img src={thumbnail} alt={sermon.title} className="sermon-thumbnail" />
            <span
              className={`sermon-type-badge badge bg-${isVideo ? 'danger' : isPdf ? 'info' : 'warning text-dark'}`}
            >
              <i
                className={`bi bi-${isVideo ? 'play-circle' : isPdf ? 'file-earmark-pdf' : 'headphones'} me-1`}
              ></i>
              {sermon.sermon_type.charAt(0).toUpperCase() + sermon.sermon_type.slice(1)}
            </span>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <i
              className={`bi bi-${isVideo ? 'camera-video' : isPdf ? 'file-earmark-pdf' : 'headphones'}`}
              style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.3)' }}
            ></i>
          </div>
        )}

        <div className="card-body">
          <h5 className="sermon-title">{sermon.title}</h5>
          {sermon.description && (
            <p className="sermon-desc">{sermon.description.slice(0, 120)}...</p>
          )}
          <div className="sermon-meta d-flex flex-wrap gap-2 mt-2">
            {sermon.speaker && (
              <span>
                <i className="bi bi-person"></i> {sermon.speaker}
              </span>
            )}
            {dateStr && (
              <span>
                <i className="bi bi-calendar3"></i> {dateStr}
              </span>
            )}
            {sermon.category && (
              <span className="badge bg-light text-dark sermon-category-badge">{sermon.category}</span>
            )}
          </div>

          {isPdf && pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3">
              <i className="bi bi-file-earmark-pdf me-2"></i>View / Download PDF
            </a>
          )}

          {spotifyEmbed && (
            <div className="sermon-spotify-embed mt-3">
              <iframe src={spotifyEmbed} width="100%" height="152" loading="lazy" title={sermon.title}></iframe>
            </div>
          )}

          {!isVideo && sermon.audio_url && (
            <div className="sermon-audio-player mt-3">
              <p className="mb-1">
                <i className="bi bi-headphones me-2"></i>Listen
              </p>
              <audio controls preload="none" src={imageUrlForDisplay(sermon.audio_url)}></audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function SermonsPage() {
  const [allSermons, videoSermons, audioSermons, pdfSermons] = await Promise.all([
    getPublishedSermons(),
    getPublishedSermons(undefined, 'video'),
    getPublishedSermons(undefined, 'audio'),
    getPublishedSermons(undefined, 'pdf'),
  ]);

  return (
    <PublicLayout>
      <style>{`
        .sermon-card { border-radius: 12px; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; }
        .sermon-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
        .sermon-video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000; border-radius: 8px; }
        .sermon-video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .sermon-audio-player { background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; padding: 1.5rem; color: #fff; }
        .sermon-audio-player audio { width: 100%; margin-top: 0.75rem; }
        .sermon-thumbnail { width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0; }
        .sermon-type-badge { position: absolute; top: 12px; right: 12px; z-index: 2; }
      `}</style>
      <PageHeader
        title="Sermons & Teaching"
        subtitle="Access our video and audio sermons to grow in your understanding of God's Word"
        background="/assets/img/videosermon.png"
      />
      <section id="sermons" className="sermons section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4 mb-5">
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="150">
              <div className="sermon-type-card h-100">
                <div className="sermon-icon">
                  <i className="bi bi-play-circle"></i>
                </div>
                <h3>Video Sermons</h3>
                <p>
                  Watch our video sermons on YouTube. Subscribe to CrossLife TV and Pastor Lenhard Kyamba&apos;s
                  channel for regular updates.
                </p>
                <div className="sermon-links mt-3">
                  <a
                    href="https://www.youtube.com/@CrossLifeTV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary me-2 mb-2"
                  >
                    <i className="bi bi-youtube me-2"></i>CrossLife TV
                  </a>
                  <a
                    href="https://www.youtube.com/@PastorLenhardKyamba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline mb-2"
                  >
                    <i className="bi bi-youtube me-2"></i>Pastor Lenhard Kyamba
                  </a>
                </div>
                <div className="sermon-image mt-4">
                  <img src="/assets/img/videosermon.png" alt="Video Sermons" className="img-fluid rounded" />
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <div className="sermon-type-card h-100">
                <div className="sermon-icon">
                  <i className="bi bi-headphones"></i>
                </div>
                <h3>Audio Sermons</h3>
                <p>Listen to our audio sermons and teachings. Stream or download audio content to listen on the go.</p>
                <div className="sermon-links mt-3">
                  <a href="/contact" className="btn btn-outline">
                    <i className="bi bi-envelope me-2"></i>Contact for Audio Access
                  </a>
                </div>
                <div className="sermon-image mt-4">
                  <img src="/assets/img/podcast.png" alt="Audio Sermons" className="img-fluid rounded" />
                </div>
              </div>
            </div>
          </div>

          {allSermons.length > 0 && (
            <>
              <div className="container section-title" data-aos="fade-up">
                <h3 className="text-center mb-2">Recent Sermons</h3>
                <p className="text-center text-muted mb-4">
                  Browse our latest video, audio, and PDF sermon uploads
                </p>
              </div>
              <div className="row g-4 mb-5">
                {allSermons.map((sermon, i) => (
                  <SermonCard key={sermon.id} sermon={sermon} delay={150 + i * 30} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
