# option

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build

`npx blueprint build` or `yarn blueprint build`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy or run another script

`npx blueprint run` or `yarn blueprint run`

### Add a new contract

`npx blueprint create ContractName` or `yarn blueprint create ContractName`


# run deployment script
npx ts-node ./scripts/deployment/deployOptionLedger.ts
# run deployment local script
npx ts-node ./scripts/deployment/tests/localDeployOptionLedger.ts

# run start option ledger script
npx ts-node ./scripts/deployment/startOptionLedger.ts

# run process option ledger script 
npx ts-node ./scripts/deployment/processOptionLedger.ts

# run place Call Option
npx ts-node ./scripts/deployment/placeCallOptionLedger.ts

# send 0.1 to SC
npx ts-node ./scripts/deployment/sendCoinToOptionLedger.ts

# run query 
npx ts-node ./scripts/query/queryContract.ts
npx ts-node ./scripts/query/queryTx.ts

# run bot
npx ts-node ./scripts/bots/botApp.ts

# run multisignature deployment
npx ts-node ./scripts/deployment/deployMultiSignatureWallet.ts
npx ts-node ./scripts/deployment/deployOptionLedger.ts
npx ts-node ./scripts/deployment/checkPubKey.ts
https://testnet.toncenter.com/api/v2/getTransactions?address=EQAcmN5eKo00YSbu6uWf7D33ToxOsJLbn4fxz1LYkHlLWyy7&limit=2&to_lt=0&archival=false


BOT ADdress -> EQAhZlhadF2tn9uBrvRDJP2ysnD-UAnWJhwXzt5FjIaqsuHA

docker build . -f ./deployments/Dockerfile -t binariesmarketacr.azurecr.io/tonoptionbot:dev


npxbinariesmarketacr.azurecr.io