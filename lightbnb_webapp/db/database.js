const { Pool } = require("pg");
const pool = new Pool({
  user: 'vagrant',
  password: 123,
  host: 'localhost',
  database: 'lightbnb',
  allowExitOnIdle: true
});

//pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

const properties = require("./json/properties.json");
const users = require("./json/users.json");
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then((result) => {
      let resolvedUser = null;
      if (result.rows[0]?.email.toLowerCase() === email?.toLowerCase()) {
        resolvedUser = result.rows[0];
      }
      return resolvedUser;
    })
    .catch((err) => {
      console.log(err.message)
      return null;
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1;`, [id])
    .then((result) => {
      let resolvedUser = null;
      if (result.rows[0]?.id === id) {
        resolvedUser = result.rows[0];
      }
      return resolvedUser;
    })
    .catch((err) => {
      console.log(err.message)
      return null;
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, email: string, password: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const values = [user.name, user.email, user.password];
  return pool
    .query(`INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING *;`, values)
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message)
      return null;
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1;`, [limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
