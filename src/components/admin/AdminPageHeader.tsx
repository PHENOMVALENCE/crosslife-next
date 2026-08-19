import Link from 'next/link';

export default function AdminPageHeader({
  title,
  subtitle,
  actionHref,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle && <p className="admin-page-lead mb-0">{subtitle}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
