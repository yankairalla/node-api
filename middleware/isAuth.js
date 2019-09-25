const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization'); // no request header(no front-end) é setado o authoriation;
	if(!authHeader) { // verificar se NÂO está setado(undefined)
		const error = new Error('Not Authenticated');
		error.statusCode = 401;
		throw error;
	}
	const token = authHeader.split(' ')[1]; // pega o token;
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, 'SecretToMyString'); // testa para ver se o token é decodificado pelo secret
	} catch (err) {
		err.statusCode = 500;
		throw err;
	}
	if(!decodedToken) {
		const error = new Error ('not Authenticated');
		error.statusCode = 401;
		throw error;
	}
	req.userId = decodedToken.userId; // nisso o userId é passado pelos requests
	next();
}