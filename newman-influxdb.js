const newman     = require('newman')
const args = require('minimist')(process.argv.slice(2))

// Get project root
var path = require('path');
var appDir = path.dirname(require.main.filename);

require('dotenv').config({
  path: appDir + '/.env'
})
  
// Check is .env file has been filled
if (process.env.COLLECTION_URL == null){
  console.log('Enter the values in the .env file')
  process.exit()
}
  
const envJsonFile = appDir + '/' + args['env']
console.log('Using environment file: ' + envJsonFile)
newman.run({
  collection: process.env.COLLECTION_URL,
  environment: envJsonFile,
  iterationCount: '1',
  insecure: true,
  reporters: 'statsd',
    reporter: {
      statsd: {
        destination: 'cqcbou1lvpmon02.staplesams.com',
        port: '8125',
      }
    }
}).on('done', function (err, summary) {
  if (err) { throw err; }
  console.log('collection run complete!')
})