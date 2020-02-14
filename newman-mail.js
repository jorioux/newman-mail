const newman     = require('newman')
const nodemailer = require('nodemailer')
const date = require('date-and-time')
const args = require('minimist')(process.argv.slice(2))
require('dotenv').config()

// Get project root
var path = require('path');
var appDir = path.dirname(require.main.filename);

let subject = ''

if (args['env'] == null){
  console.log('Specify --env variable with environment file to use')
  process.exit()
}

const now = new Date()
const nowString = date.format(now, 'YYYY-MM-DD HH:mm:ss')
const reportFile = args['env'] + '_' + date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.html'
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

  if(summary.run.failures.length > 0){
    subject = args['env'] + ' FAILED (' + summary.run.failures.length + ') ' + nowString
  } else {
    subject = args['env'] + ' success ' + nowString
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
