# newman-mail

Setup a cronjob to receive beautiful newman HTML reports by email.

## Usage

Copy `.env.template` to `.env` and fill the values.

Copy the environment json files from Postman to the newman-mail folder.

```sh
npm install
node newman-mail.js --env=dev.postman_environment.json

# if using local collection json file
node newman-mail.js --env=dev.postman_environment.json --collection=MyCollection.postman_collection.json
```

## Contribute

PRs are welcome!
