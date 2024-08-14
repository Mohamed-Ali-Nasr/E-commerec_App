export const replaceFilters = (filters: any) => {
  const filtersAsString = JSON.stringify(filters);
  const replacesFilters = filtersAsString.replaceAll(
    /lt|gt|lte|gte|regex|ne|eq/gi,
    (ele) => `$${ele}`
  );
  const parsedFilters = JSON.parse(replacesFilters);

  return { parsedFilters };
};
