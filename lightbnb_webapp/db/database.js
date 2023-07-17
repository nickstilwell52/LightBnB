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
const { query } = require("express");
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then((result) => {
      let resolvedUser = null;
      if (result.rows[0]?.email?.toLowerCase() === email?.toLowerCase()) {
        resolvedUser = result.rows[0];
      }
      return resolvedUser;
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
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
      console.log(err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, email: string, password: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const values = [user.name, user.email, user.password];
  return pool
    .query(`INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING *;`, values)
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const values = [guest_id, limit];
  return pool
    .query(`
    SELECT properties.*, title, cost_per_night, start_date, avg(rating) as average_rating
    FROM users
    JOIN reservations ON guest_id = users.id
    JOIN properties ON properties.id = reservations.property_id
    JOIN property_reviews ON property_reviews.property_id = properties.id
    WHERE users.id=$1
    GROUP BY properties.id, start_date
    ORDER BY start_date
    LIMIT $2;
    `, values)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err);
    });
};
/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

/**
 * possible options for getAllProperties
 * @param options.city,
 * @param options.owner_id,
 * @param options.minimum_price_per_night,
 * @param options.maximum_price_per_night,
 * @param options.minimum_rating
 */


const getAllProperties = function(options, limit = 10) {
//setup parameters array / query string
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

// add WHERE/AND if needed
  let w = false;
  const isWhereThere = () => {  
    if (queryParams.length > 1) {
      queryString += ` AND `;
    }
    if (!w) {
      queryString += `WHERE `;
      w = true;
    }
  };

  for (const [k, v] of Object.entries(options)) {

    if ((v) && k === 'city') {
      queryParams.push(`%${options[k]}%`);
      isWhereThere();
      queryString += `city LIKE $${queryParams.length}`;
    } else if ((v) && k === 'owner_id') {
      queryParams.push(`${options[k]}`);
      isWhereThere();
      queryString += `properties.owner_id = $${queryParams.length}`;
    } else if ((v) && k === 'minimum_price_per_night') {
      queryParams.push(`${options[k]}`);
      isWhereThere();
      queryString += `properties.cost_per_night >= $${queryParams.length}`;
    } else if ((v) && k === 'maximum_price_per_night') {
      queryParams.push(`${options[k]}`);
      isWhereThere();
      queryString += `properties.cost_per_night <= $${queryParams.length}`;
    }
  }
// add more queries that come after the WHERE clause
  queryString += ` GROUP BY `;
  queryString += `properties.id`;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` HAVING `;
    queryString += `avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  // run the query
  return pool.query(queryString, queryParams)
  .then((res) => res.rows)
  .catch((err) => console.log(err));

};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
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