import pkg from "knex";
import config from "../../../knexfile.js";
import { attachPaginate } from "knex-paginate";

const { knex: knexConfig } = pkg;
const environment = process.env.NODE_ENV || "development";
const knex = knexConfig(config[environment]);

attachPaginate();

export { knex };
