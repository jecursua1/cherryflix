// Reusable avatar: shows the profile photo if set, else a colored initial.
export default function Avatar({
  image,
  name,
  size = 32,
  rounded = "rounded-md",
  className = "",
}: {
  image?: string | null;
  name?: string | null;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  const style = { width: size, height: size };
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt={name ?? ""}
        style={style}
        className={`shrink-0 object-cover ${rounded} ${className}`}
      />
    );
  }
  return (
    <span
      style={style}
      className={`grid shrink-0 place-items-center bg-cherry font-bold text-white ${rounded} ${className}`}
    >
      {initial}
    </span>
  );
}
