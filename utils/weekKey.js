export const getWeekKey = () => {
  const now = new Date();
  const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
  firstDay.setHours(0, 0, 0, 0);
  return firstDay.toISOString().slice(0, 10); // YYYY-MM-DD
};
