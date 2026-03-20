/**
 * Returns a human-readable age string from a birthday date string.
 * Example: "2 years and 4 months old" or "8 months old"
 */
export function formatAge(birthday) {
  if (!birthday) return null;
  const birth = new Date(birthday + "T00:00:00");
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) { years--; months += 12; }
  if (now.getDate() < birth.getDate()) months--;
  if (months < 0) { years--; months += 12; }

  if (years < 0) return null;

  const y = years > 0 ? `${years} year${years !== 1 ? "s" : ""}` : "";
  const m = months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : "";

  if (y && m) return `${years}y ${months}mo`;
  if (y) return `${years}y`;
  if (m) return `${months}mo`;
  return "newborn";
}