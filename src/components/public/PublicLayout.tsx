import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import SearchModal from '@/components/public/SearchModal';
import PublicScripts from '@/components/public/PublicScripts';

export default function PublicLayout({
  children,
  includeHomeExtras = false,
}: {
  children: React.ReactNode;
  includeHomeExtras?: boolean;
}) {
  return (
    <>
      <Header />
      <main className="main">{children}</main>
      <SearchModal />
      <Footer />
      <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>
      <div id="preloader"></div>
      <PublicScripts includeHomeExtras={includeHomeExtras} />
    </>
  );
}
