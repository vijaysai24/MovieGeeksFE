import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
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
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ground">
        Skip to content
      </a>
      <ScrollToTop />
      <NavBar />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <MobileTabBar />
    </div>
  );
}

export default MainDashboard;
