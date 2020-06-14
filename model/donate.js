connection = require('../DB');

let insertDonate = (input, legit, response) => {
    // console.log()
    connection.getDB().query(`insert into donation set ? `, input, response);
    console.log('Data Inserted = ', input)
}
module.exports = {
    insertDonate: insertDonate,
}

// date format DATE_FORMAT(date, "%W %M %e %Y")
