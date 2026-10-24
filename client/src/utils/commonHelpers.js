function pad(n) {
  return String(n).padStart(2, '0');
}

// Today's date as YYYY-MM-DD in the user's own timezone (toISOString would give the UTC date).
export function todayInputValue() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// What to send to the server for a record that can be dated in the past.
// Today -> nothing (the server stamps the current time).
// A past date -> noon of that day in the user's timezone, so it never slips to another day.
export function buildBackdatedISO(dateValue) {
  if (!dateValue || dateValue === todayInputValue()) return undefined;
  return new Date(`${dateValue}T12:00:00`).toISOString();
}