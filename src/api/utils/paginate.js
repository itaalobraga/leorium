export const paginate = ({ query, limit, page }) => {
  return query.paginate({
    perPage: limit || 10,
    currentPage: page || 1,
  });
};
