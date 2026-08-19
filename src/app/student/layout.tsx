export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link href="/assets/css/auth-premium.css" rel="stylesheet" />
      <link href="/assets/css/student-dashboard.css" rel="stylesheet" />
      <link href="/assets/css/student-premium.css" rel="stylesheet" />
      {children}
    </>
  );
}
