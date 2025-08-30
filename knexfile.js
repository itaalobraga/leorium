const config = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./src/api/database/database.db",
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run("PRAGMA foreign_keys = ON", cb);
      },
    },
    useNullAsDefault: true,
    migrations: {
      extension: "js",
      directory: "./src/api/database/migrations",
    },
    seeds: {
      extension: "js",
      directory: "./src/api/database/seeds",
    },
  },

  production: {
    client: "sqlite3",
    connection: {
      filename: "./src/api/database/database.db",
    },
    pool: {
      min: 2,
      max: 10,
      afterCreate: (conn, cb) => {
        conn.run("PRAGMA foreign_keys = ON", cb);
      },
    },
    useNullAsDefault: true,
    migrations: {
      extension: "js",
      directory: "./src/api/database/migrations",
    },
    seeds: {
      extension: "js",
      directory: "./src/api/database/seeds",
    },
  },
};

export default config;
