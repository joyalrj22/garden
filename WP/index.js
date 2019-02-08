const api = require('./app');


api.listen(8080, '0.0.0.0', function() {
	console.log("Server running");
});