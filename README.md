# newman-mail
Setup an a cronjob to receive beautiful newman HTML reports by email.

Copy `.env.template` to `.env` and fill the values.

## Run the script

Usage:

`
node newman-mail.js --env=<envfile_from_postman>
`

Example:

`
node newman-mail.js --env=dev.postman_environment.json
`

## Contribute

PRs are welcome!