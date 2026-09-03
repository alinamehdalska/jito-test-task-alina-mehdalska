const integer = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const time = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const longWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
const dayAndMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });
const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

/** `1240` → `1,240`. Calorie figures are always whole numbers. */
export function formatKcal(value: number): string {
  return integer.format(value);
}

/** Macro grams: whole numbers on the dashboard, one decimal where a serving is being tuned. */
export function formatGrams(value: number, decimals: 0 | 1 = 0): string {
  return `${decimals === 1 ? oneDecimal.format(value) : integer.format(value)} g`;
}

/** `08:30` — 24-hour, zero-padded, as the diary rows show it. */
export function formatTime(date: Date): string {
  return time.format(date);
}

/** `Thursday, 28 August` — en-GB drops the comma, the design keeps it. */
export function formatDayTitle(date: Date): string {
  return `${longWeekday.format(date)}, ${dayAndMonth.format(date)}`;
}

/** `Thu`. */
export function formatWeekday(date: Date): string {
  return weekday.format(date);
}
