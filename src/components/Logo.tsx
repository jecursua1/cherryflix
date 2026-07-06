// Cherryflix wordmark. Uses the light-recolored logo so the "flix" reads on
// the dark theme. Height-driven; width auto-scales (logo is ~2:1).
export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/cherryflix-logo-light.png"
      alt="Cherryflix"
      className={className}
    />
  );
}
