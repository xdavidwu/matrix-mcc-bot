const sdk = require('matrix-js-sdk');
const client = sdk.createClient(process.env.MATRIX_BASEURL);
client.login("m.login.password", {"user": process.env.MATRIX_USER, "password": process.env.MATRIX_PASSWORD}).then((response) => {
    console.log(response.access_token);
});
