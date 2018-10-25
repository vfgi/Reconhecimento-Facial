const request = require('jquery');

    function requestApi() {
        request('http://ec2-174-129-81-79.compute-1.amazonaws.com/user/find', function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            const bodyParse = JSON.parse(body);
            bodyParse.forEach(element => {
                console.log('Id WelcomeApp:', element.idWApp); // Print the HTML for the Google homepage.
                console.log('Nome WelcomeApp: ', element.name);
                return element.idWApp
            });
        });
    }

module.exports = new requestApi();

