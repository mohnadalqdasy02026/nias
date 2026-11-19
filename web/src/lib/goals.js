// Goals are stored as TEXT[] but edited in a textarea (one goal per line).
export const goalsToText = (goals) =>
  Array.isArray(goals) ? goals.join('\n') : (goals ?? '');
