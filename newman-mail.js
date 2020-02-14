const newman     = require('newman')
const nodemailer = require('nodemailer')
const date = require('date-and-time')
const args = require('minimist')(process.argv.slice(2))

// Get project root
var path = require('path');
var appDir = path.dirname(require.main.filename);

require('dotenv').config({
  path: appDir + '/.env'
})

let subject = ''

// Check if --env parameter has been passed
if (args['env'] == null){
  console.log('Specify --env variable with environment file to use')
  process.exit()
}

// Check is .env file has been filled
if (process.env.COLLECTION_URL == null){
  console.log('Enter the values in the .env file')
  process.exit()
}

const now = new Date()
const nowString = date.format(now, 'YYYY-MM-DD HH:mm:ss')
const reportFile = args['env'].split('.')[0] + '_' + date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.html'
const envJsonFile = appDir + '/' + args['env']

console.log('Using environment file: ' + envJsonFile)

newman.run({
  collection: process.env.COLLECTION_URL,
  environment: envJsonFile,
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
    subject = args['env'].split('.')[0] + ' FAILED (' + summary.run.failures.length + ') ' + nowString
  } else {
    subject = args['env'].split('.')[0] + ' success ' + nowString
  }
  console.log(subject)

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
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
  });
})
