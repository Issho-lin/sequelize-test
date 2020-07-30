const mysql = require('mysql');
const cfg = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lqb_sql'
};
const conn = mysql.createConnection(cfg);

conn.connect(err => {
    if (err) {
        throw err;
    } else {
        console.log('连接成功');
    }
});

const CREATE_SQL = 'CREATE TABLE IF NOT EXISTS test (id INT NOT NULL AUTO_INCREMENT, message VARCHAR(45) NULL, PRIMARY KEY (id))';
const INSERT_SQL = 'INSERT INTO test(message) VALUE(?)';
const SELECT_SQL = 'SELECT * FROM test';



conn.query(CREATE_SQL, err => {
    if (err) {
        throw err;
    } else {
        console.log('创建成功');
        conn.query(INSERT_SQL, 'hello,mysql', (err, res) => {
            if (err) {
                throw err;
            } else {
                console.log(res);
            }
            conn.query(SELECT_SQL, (err, res) => {
                if (err) {
                    throw err;
                } else {
                    console.log(res);
                    conn.end();
                }
            })
        })
    }
});