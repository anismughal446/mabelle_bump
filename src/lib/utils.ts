export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const TRIMESTERS = [
  { key: "1st", label: "1st Trimester" },
  { key: "2nd", label: "2nd Trimester" },
  { key: "3rd", label: "3rd Trimester" },
  { key: "postpartum", label: "Postpartum" },
];

export const OCCASIONS = ["everyday", "workwear", "loungewear", "occasion", "activewear"];

export const SIZES = ["One Size", "XS", "S", "M", "L", "XL", "XXL"];

export function trimesterFromDueDate(dueDate?: string | null): string | null {
  if (!dueDate) return null;
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const weeksUntilDue = (due - now) / (1000 * 60 * 60 * 24 * 7);
  const gestWeek = 40 - weeksUntilDue;
  if (gestWeek < 0) return "postpartum";
  if (gestWeek <= 13) return "1st";
  if (gestWeek <= 27) return "2nd";
  if (gestWeek <= 40) return "3rd";
  return "postpartum";
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
