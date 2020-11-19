# Golem Network Token migration script

This script can be used to migrate tokens from GNTv1 to GNTv2

## Requirements

To run script, you need to have Node.js 10 or newer installed 

## Usage

1. Setup project
```{bash}
git clone git@github.com:golemfactory/gnt-migration-script
npm install
```
2. Run script
You will need to set two environment variables
* `RPC_URL`: HTTP URL to an ethereum node (e.g. infura)
* `PRIVATE_KEY`: Private key of the account holding GNTv1 tokens

Running `RPC_URL="..." PRIVATE_KEY="..." npm run migrate` will send the migration transaction

### Development

To run tests, simply run `npm test`
