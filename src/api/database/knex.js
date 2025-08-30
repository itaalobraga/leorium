import pkg from "knex";
import config from "../../../knexfile.js";

const { knex: knexConfig } = pkg;
const environment = process.env.NODE_ENV || "development";
const knex = knexConfig(config[environment]);

export { knex };
