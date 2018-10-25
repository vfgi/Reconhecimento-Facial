var cron = require('node-cron');
const request = require('./functionRequest');
request.requestApi();

cron.schedule('* 1 * * *', () => {
  console.log('Rodando rotina de download de arquivos.')
});