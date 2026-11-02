import { useAuth } from "../../Context/AuthContext";
import { LinkButton } from "../UI/Button";

// The page closes on a question with two answers: log what you saw, or find something now.
function ClosingQuestion() {
  const { isMember } = useAuth();

  return (
    <section className="section-gap" aria-labelledby="closing-title">
      <div className="page flex min-h-[86svh] flex-col justify-between py-8 text-center md:min-h-[100svh]">
        <h2 id="closing-title" className="display text-[clamp(3.25rem,1rem+10vw,10.5rem)] leading-[0.95] text-ink">
          <span className="block">Seen anything</span>
          <span className="sr-only"> good lately?</span>
        </h2>

        <div className="flex flex-col items-center">
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-8">
            <LinkButton to={isMember ? "/search" : "/register"} variant="accent" size="lg" className="w-[72%] sm:w-52">
              Log It
            </LinkButton>
            <span className="text-[17px] text-muted">or</span>
            <LinkButton to="/#tonight" variant="primary" size="lg" className="w-[72%] sm:w-52" onClick={() => document.getElementById("tonight")?.scrollIntoView({ behavior: "smooth" })}>
              Find One
            </LinkButton>
          </div>
          <p className="mt-5 max-w-[48ch] text-[15px] text-muted">
            {isMember ? "Log it to your diary with a date and a score, or let Tonight's Pick choose for you." : "Start a free diary for what you saw, or let Tonight's Pick choose something now."}
          </p>
        </div>

        <p aria-hidden="true" className="display text-[clamp(3.25rem,1rem+10vw,10.5rem)] leading-[0.95] text-ink">good lately?</p>
      </div>
    </section>
  );
}

export default ClosingQuestion;
