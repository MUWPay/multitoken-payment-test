## Multitoken payment demo: 

- This is the demo package implementation of the workflow for muwpay, to allow users with multiple tokens (from single wallet) to be able to swap across aggregators, and able to fetch the token in final denomination , and then transfer and gets the finality of the transaction.

## Packages used 
- [Lifi-sdk]().
- [Biconomy]().
- [external-key]().

## Workflow: 

1. We get the Quotation of the potential multi token paths by considering parallel executions of the token address .

2. Then based on the potential route path returned by the Lifi, we will then
  - Create the smartAccount of the user.
  - Using the smartAccount's sendBatchTransfer to do batch approval for spending of the tokens to the spender address(ie the intermediate exchange address that want to spend the user tokens for the swap and then transfer if the exchange is successful, or to fetch the result ).
  - Also for the cross-chain bridge transfers: based on the nature of bridge (whether user will have to claim the transaction and pay the fees), we can also create the encoded transaction that will be signed by the wallet address and then delegated to the relayer.
    -  And then based on the actual execution status is passed, we then can execute the transaction without affecting the UX workflow and switches of the transaction.

3. Now once the token approval for all the intermediate adddress for the given amount is done, we will then run the execution, here unlike the previous operations you will not have to 




## Running the script: 

1. Adding the `.env` parameters (as defined in the `.env.example`).

2. run the command as follows: 
```terminal
$ ts-node scripts/test_priv_key.ts

```