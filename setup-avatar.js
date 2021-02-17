const sdk = require('matrix-js-sdk');
const client = sdk.createClient({
	baseUrl: process.env.MATRIX_BASEURL,
	accessToken: process.env.MATRIX_ACCESS_TOKEN,
	userId: process.env.MATRIX_USER
});
client.setAvatarUrl(process.env.MATRIX_AVATAR);
