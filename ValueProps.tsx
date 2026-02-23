const props = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
    title: "Vetted Craftspeople",
    description:
      "Every professional in our network is thoroughly screened — licensed, insured, and proven by their track record across Vermont homes.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "On Time. On Budget.",
    description:
      "We coordinate every phase of your project with clear milestones, honest pricing, and proactive communication — so there are no surprises.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
    title: "Built for Vermont",
    description:
      "From historic farmhouses to modern ski chalets, we understand the unique demands of Vermont homes — the climate, the character, and the craft.",
  },
];

export default function ValueProps() {
  return (
    <section
      id="value-props"
      className="bg-darker py-20 sm:py-28"
      aria-label="Why Alder Projects"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
            Why Alder Projects
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
            The Standard You Deserve
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.map((prop, i) => (
            <div
              key={i}
              className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-accent/20 rounded-2xl p-8 transition-all duration-300"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-6 group-hover:bg-accent/15 transition-colors">
                {prop.icon}
              </div>

              <h3 className="font-semibold text-white text-lg mb-3">
                {prop.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {prop.description}
              </p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />**
