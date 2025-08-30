export const workloadPattern = (value) => {
  const regex =
    /^\d+(\.\d+)?\s*(hora|horas|minuto|minutos|dias|dia|meses|mês|ano|anos|semana|semanas)$/i;
  return regex.test(value.trim());
};
