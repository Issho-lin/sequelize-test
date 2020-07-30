(async () => {
    const mysql = require('mysql2/promise');
    const { config, CREATE_SQL, INSERT_SQL, SELECT_SQL } = require('./common');
    const conn = await mysql.createConnection(config);
    let ret = await conn.execute(CREATE_SQL);
    console.log('create：', ret);
    ret = await conn.execute(INSERT_SQL, ['abc']);
    console.log('insert：', ret);
    const [rows, fields] = await conn.execute(SELECT_SQL);
    console.log(rows, fields);
})()