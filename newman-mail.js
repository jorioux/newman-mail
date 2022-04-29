const newman = require('newman')
const nodemailer = require('nodemailer')
const date = require('date-and-time')
const args = require('minimist')(process.argv.slice(2))
const axios = require('axios').default
const fs = require('fs');

// Get project root
var path = require('path');
var appDir = path.dirname(require.main.filename);

require('dotenv').config({
  path: appDir + '/.env'
})

let subject = ''

// Check is .env file has been filled
if (process.env.COLLECTION_URL == null && args['collection'] == null){
  console.log('Enter the values in the .env file')
  process.exit()
}

async function main() {

  var collectionJSON = []

  if (! args['collection']) {
    let response = await axios.get(process.env.COLLECTION_URL)
    collectionJSON = response.data
  } else {
    let rawdata = fs.readFileSync(args['collection']);
    collectionJSON = JSON.parse(rawdata);
  }

  const collection = args['collection'] ? args['collection'] : process.env.COLLECTION_URL
  console.log('Using collection: ' + collection)

  if (! collectionJSON.info?.name) {
    console.log('Invalid collection')
    process.exit()
  }
  var prefix = collectionJSON.info.name + (args['env'] ? '_' + args['env'].split('.')[0] : '')

  console.log('prefix: ' + prefix)

  const now = new Date()
  const nowString = date.format(now, 'YYYY-MM-DD HH:mm:ss')
  
  var reportFile = prefix + '_' + date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.html'

  newman.run({
    collection: collection,
    environment: args['env'] ? appDir + '/' + args['env'] : null,
    iterationCount: '1',
    insecure: true,
    reporters: 'htmlextra',
      reporter: {
        htmlextra: {
          export: reportFile,
          skipSensitiveData: true,
          omitHeaders: true,
          darkTheme: true
        }
      }
  }).on('done', function (err, summary) {

    // Generate the email subject
    if(summary.run.failures.length > 0){
      subject = prefix + ' FAILED (' + summary.run.failures.length + ') ' + nowString
    } else {
      subject = prefix + ' success ' + nowString
    }
    console.log(subject)

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    let mailOptions = {
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: subject,
      attachments: [
        {
          filename: reportFile,
          path: reportFile
        }
      ]
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error)
    } else {
        console.log('Email sent: ' + info.response)
    }
    })
  })
}

main()
