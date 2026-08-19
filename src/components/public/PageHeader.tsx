export default function PageHeader({
  title,
  subtitle,
  background = '/assets/img/_MG_5282.jpg',
}: {
  title: string;
  subtitle: string;
  background?: string;
}) {
  return (
    <section
      className="page-header section dark-background"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${background}') center/cover`,
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <h1 data-aos="fade-up">{title}</h1>
            <p data-aos="fade-up" data-aos-delay="100">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
