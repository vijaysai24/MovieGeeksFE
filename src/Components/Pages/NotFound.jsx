import { LinkButton } from "../UI/Button";

function NotFound() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
      <h1 className="display max-w-[14ch] text-[clamp(3rem,7vw,6rem)] text-ink">This reel is missing</h1>
      <p className="mt-6 max-w-[44ch] text-[17px] text-muted">The page you asked for doesn't exist, or it moved. Try finding the film instead.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton to="/" variant="primary" size="lg">Back to the home page</LinkButton>
        <LinkButton to="/discover" variant="secondary" size="lg">Discover films</LinkButton>
      </div>
    </div>
  );
}

export default NotFound;
