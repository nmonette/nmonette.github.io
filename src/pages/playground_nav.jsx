import { Link } from "react-router";

const playgrounds = [
  { number: 1, title: "Other-play for zero-shot coordination" },
  { number: 2, title: "Thompson Sampling" },
  { number: 3, title: "Optimistic gradients" },
  { number: 4, title: "Counterfactual regret minimization" },
  { number: 5, title: "Double Oracle" },
];

function PlaygroundNav({ current }) {
  const previous = playgrounds[current - 2];
  const next = playgrounds[current];

  return (
    <div className="playground-header-top">
      <p className="playground-kicker">
        Playground / {String(current).padStart(2, "0")}
      </p>
      <nav className="playground-sequence" aria-label="Playground experiments">
        {previous && (
          <Link
            to={`/playground/${String(previous.number).padStart(2, "0")}`}
            aria-label={`Previous playground: ${previous.title}`}
          >
            ← &nbsp;{previous.title}
            <span>Previous</span>
          </Link>
        )}
        {next && (
          <Link
            to={`/playground/${String(next.number).padStart(2, "0")}`}
            aria-label={`Next playground: ${next.title}`}
          >
            <span>Next</span>
            {next.title}&nbsp; →
          </Link>
        )}
      </nav>
    </div>
  );
}

export default PlaygroundNav;
