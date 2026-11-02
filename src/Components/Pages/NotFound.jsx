import { LinkButton } from "../UI/Button";

function NotFound() {
  return (
    <div className="page py-24 md:py-36">
      <h1 className="display max-w-[14ch] text-hero leading-[0.95] text-ink">This reel is missing</h1>
      <p className="mt-8 max-w-[44ch] text-lead text-muted">The page you asked for doesn’t exist, or it moved. Try finding the film instead.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton to="/" variant="primary" size="lg">Back to the Home Page</LinkButton>
        <LinkButton to="/discover" variant="secondary" size="lg">Discover Films</LinkButton>
      </div>
    </div>
  );
}

export default NotFound;
