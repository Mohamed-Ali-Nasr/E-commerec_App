import { replaceFilters } from "./replace-filters.util";

export class ApiFeatures {
  model: any;
  query: any;
  filterObject: any;
  paginationObject: any;
  mongooseQuery: any;
  constructor(mongooseQuery: any, model: any, query: any) {
    // Product | Category | SubCategory |...
    this.model = model;

    this.mongooseQuery = mongooseQuery;
    // req.query
    this.query = query;
    // Will be the filters we needed to apply | {}
    this.filterObject = {};
    // Will be the pagination object we needed to apply | {}
    this.paginationObject = {};
  }

  // pagination
  pagination() {
    const { page = 1, limit = 2 } = this.query;
    const skip = (page - 1) * limit;

    this.paginationObject = {
      limit: parseInt(limit),
      skip,
      page: parseInt(page),
    };

    console.log(
      "============ paginationObject in pagination() ==========",
      this.paginationObject
    );

    this.mongooseQuery = this.model.paginate(
      this.filterObject,
      this.paginationObject
    );
    return this;
  }

  // sorting
  sort() {
    const { sort } = this.query;

    if (sort) {
      this.paginationObject.sort = sort;

      console.log(
        "============ paginationObject in sort()==========",
        this.paginationObject
      );

      this.mongooseQuery = this.model.paginate(
        this.filterObject,
        this.paginationObject
      );
    }
    return this;
  }

  // filters
  filters() {
    const { page = 1, limit = 5, sort, ...filters } = this.query;
    const { parsedFilters } = replaceFilters(filters);

    this.filterObject = parsedFilters;

    this.mongooseQuery = this.model.paginate(
      this.filterObject,
      this.paginationObject
    );

    return this;
  }
}
