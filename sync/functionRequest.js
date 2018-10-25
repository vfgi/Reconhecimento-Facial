const request = require('request');
const shellExec = require('shell-exec');
const fs = require('fs');
class Request {
    requestApi() {
        request('http://ec2-174-129-81-79.compute-1.amazonaws.com/user/find', function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            const bodyParse = JSON.parse(body);
            let objects = [];
            let i = 0;
            bodyParse.forEach(element => {
                objects[i] = element.idWApp;
                let j = 1;
                fs.exists(`${element.idWApp}`, (retorno) => {
                    if(retorno == true){
                        console.log('Pasta já baixada.')
                    }
                    else{
                        shellExec(`mkdir ../site/public/img/people/${element.idWApp}`)
                        while (j <= 20) {
                            shellExec(`curl -o ../site/public/img/people/${element.idWApp}/${j}.png http://admin-facial-reco.s3-website-us-east-1.amazonaws.com/bucket/${element.idWApp}/${j}.png`)
                            console.log(`Imagem Baixada: ${element.name}, id: ${element.idWApp}, imagem: ${j}`)
                            j++;
                        }
                        i++;
                    }
                })
            });
        });
    }
}
module.exports = new Request();

