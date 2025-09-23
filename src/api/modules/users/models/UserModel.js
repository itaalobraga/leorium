import bcrypt from "bcrypt";
import { knex } from "../../../database/knex.js";

export class UserModel {
  async create(userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const [result] = await knex("users").insert(userData).returning("*");
    return result;
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    let query = knex("users").select(
      "id",
      "name",
      "email",
      "role",
      "bio",
      "avatar",
      "specialization",
      "created_at"
    );

    if (filters.role) {
      query = query.where("role", filters.role);
    }

    if (filters.search) {
      query = query.where((builder) => {
        builder
          .where("name", "like", `%${filters.search}%`)
          .orWhere("email", "like", `%${filters.search}%`);
      });
    }

    const data = await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    const totalCount = await this.count(filters);

    return {
      data,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        total: totalCount,
      },
    };
  }

  async findById(id) {
    return await knex("users").where({ id }).first();
  }

  async findByEmail(email) {
    return await knex("users").where({ email }).first();
  }

  async update(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const [result] = await knex("users")
      .where({ id })
      .update(userData)
      .returning("*");

    return result;
  }

  async delete(id) {
    return await knex("users").where({ id }).del();
  }

  async emailExists(email, excludeId = null) {
    let query = knex("users").where({ email });

    if (excludeId) {
      query = query.whereNot({ id: excludeId });
    }

    const result = await query.first();
    return !!result;
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async count(filters = {}) {
    let query = knex("users");

    if (filters.role) {
      query = query.where("role", filters.role);
    }

    if (filters.search) {
      query = query.where((builder) => {
        builder
          .where("name", "like", `%${filters.search}%`)
          .orWhere("email", "like", `%${filters.search}%`);
      });
    }

    const [{ count }] = await query.count("* as count");
    return parseInt(count);
  }

  async hasCourses(userId) {
    const result = await knex("courses").where("instructor_id", userId).first();
    return !!result;
  }

  async findByIdSafe(id) {
    const user = await this.findById(id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async authenticate(email, password) {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await this.validatePassword(
      password,
      user.password
    );

    if (!isValidPassword) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
