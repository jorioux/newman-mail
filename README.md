# newman-mail
Setup an a cronjob to receive beautiful newman HTML reports by email.

## Usage

Copy `.env.template` to `.env` and fill the values.

Copy the environment json files from Postman to the newman-mail folder.

```
npm install
node newman-mail.js --env=dev.postman_environment.json
```

## Contribute

PRs are welcome!