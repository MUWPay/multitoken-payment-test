import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { getSmartAccount } from "./smartAccount";
import { sendBatchTx } from "./batchTransaction";
const HDWalletProvider = require("@truffle/hdwallet-provider");

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;
const dappAPIKey = process.env.DAPP_API_KEY;

(async () => {
	try {
		const provider = new HDWalletProvider(privateKey, rpcUrl);
		const walletProvider = new ethers.providers.Web3Provider(provider);
		const smartAccount = await getSmartAccount(walletProvider, dappAPIKey);

		const amount = ethers.BigNumber.from("1");
		await sendBatchTx(smartAccount, amount);

		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
})();
