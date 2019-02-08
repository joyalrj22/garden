const api = require('./app');


api.listen(8080||process.env.PORT, () => {
 console.log("Server running");
});