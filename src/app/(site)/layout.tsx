import SiteHeader from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-black/10 py-6 text-center text-sm text-black/50">
        AutoParts Hub — car accessories for your exact brand and model.
      </footer>
    </>
  );
}
