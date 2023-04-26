## Progress till now

-   Smart Account is getting created
-   Gas tank is setup and funded with 1 MATIC
-   **createUserPaidTransactionBatch()** is failing due to invalid hex value (indeed true, we just don't know yet how to solve this?)

## Notes

-   We have deployed + verified an ERC20 token contract at [0x4F0a60C531e1731985bC20F321E76A42a4663bEd](https://mumbai.polygonscan.com/address/0x4F0a60C531e1731985bC20F321E76A42a4663bEd)
-   Account **0x069D9dE7371E16F8E3CADB4B0eafFF40cd977A00** has `100000 tokens` of the above contract
-   Private key of the above mentioned account is already added in `.env`

## Run script

```bash
npm run go
```
