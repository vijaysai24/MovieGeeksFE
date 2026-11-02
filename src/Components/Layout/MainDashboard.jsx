import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar, { HERO_ROUTES } from "./NavBar";
import Footer from "./Footer";
import MobileTabBar from "./MobileTabBar";

// New pages open at the top; filter changes on the same page keep the scroll position.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainDashboard() {
  const { pathname } = useLocation();
  const overHero = HERO_ROUTES.test(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ground">
        Skip to Content
      </a>
      <ScrollToTop />
      <NavBar />

      <main id="main" className={`flex-1 bg-ground pb-24 md:pb-32 ${overHero ? "" : "pt-14 md:pt-16"}`}>
        <Outlet />
      </main>

      <Footer />
      <MobileTabBar />
    </div>
  );
}

export default MainDashboard;
