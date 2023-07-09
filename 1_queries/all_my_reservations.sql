SELECT properties.id, title, cost_per_night, start_date, avg(rating) as average_rating
FROM users
JOIN reservations ON guest_id = users.id
JOIN properties ON properties.id = reservations.property_id
JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE email='tristanjacobs@gmail.com'
GROUP BY properties.id, start_date
ORDER BY start_date
LIMIT 10;