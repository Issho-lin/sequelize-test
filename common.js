module.exports.config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lqb_sql'
};
module.exports.CREATE_SQL = 'CREATE TABLE IF NOT EXISTS test (id INT NOT NULL AUTO_INCREMENT, message VARCHAR(45) NULL, PRIMARY KEY (id))';
module.exports.INSERT_SQL = 'INSERT INTO test(message) VALUE(?)';
module.exports.SELECT_SQL = 'SELECT * FROM test';