import { ethers, BigNumber } from "ethers";

export const sendBatchTx = async (smartAccount: any, amount: BigNumber) => {
	try {
		// creating an array of txs
		const txs = [];

		// creating erc20 interface
		const erc20Interface = new ethers.utils.Interface([
			{
				constant: true,
				inputs: [],
				name: "name",
				outputs: [
					{
						name: "",
						type: "string",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_spender",
						type: "address",
					},
					{
						name: "_value",
						type: "uint256",
					},
				],
				name: "approve",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "totalSupply",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_from",
						type: "address",
					},
					{
						name: "_to",
						type: "address",
					},
					{
						name: "_value",
						type: "uint256",
					},
				],
				name: "transferFrom",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "decimals",
				outputs: [
					{
						name: "",
						type: "uint8",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_owner",
						type: "address",
					},
				],
				name: "balanceOf",
				outputs: [
					{
						name: "balance",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "symbol",
				outputs: [
					{
						name: "",
						type: "string",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_to",
						type: "address",
					},
					{
						name: "_value",
						type: "uint256",
					},
				],
				name: "transfer",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_owner",
						type: "address",
					},
					{
						name: "_spender",
						type: "address",
					},
				],
				name: "allowance",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				payable: true,
				stateMutability: "payable",
				type: "fallback",
			},
			{
				anonymous: false,
				inputs: [
					{
						indexed: true,
						name: "owner",
						type: "address",
					},
					{
						indexed: true,
						name: "spender",
						type: "address",
					},
					{
						indexed: false,
						name: "value",
						type: "uint256",
					},
				],
				name: "Approval",
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						indexed: true,
						name: "from",
						type: "address",
					},
					{
						indexed: true,
						name: "to",
						type: "address",
					},
					{
						indexed: false,
						name: "value",
						type: "uint256",
					},
				],
				name: "Transfer",
				type: "event",
			},
		]);

		// for testing purposes, i am just calling two transfers for now
		// later on, we can try with approve + transfer functionality

		// first transfer
		const data1 = erc20Interface.encodeFunctionData("transfer", [
			"0xA8Ae542cEB682c230DCDc043Ebdd2DE1386cD2B9",
			amount,
		]);
		const tx1 = {
			to: "0x4F0a60C531e1731985bC20F321E76A42a4663bEd",
			data: data1,
		};
		txs.push(tx1);

		// second transfer
		const data2 = erc20Interface.encodeFunctionData("transfer", [
			"0x79b0B7Aa68350291A2b01B364Aa37672316Bb223",
			amount,
		]);
		const tx2 = {
			to: "0x4F0a60C531e1731985bC20F321E76A42a4663bEd",
			data: data2,
		};
		txs.push(tx2);

		// getting fee quotes, it gives an array
		const feeQuotes = await smartAccount.getFeeQuotesForBatch({
			transactions: txs,
		});
		console.log("Fee quotes are", feeQuotes);

		// === here createUserPaidTransactionBatch(), the script is failing because of invalid hex value (yes, it is indeed invalid -- you can check from console) ===
		// creating user paid transaction batch
		// we will just pay in native token, so selecting index 0 in feeQuotes array
		const transaction = await smartAccount.createUserPaidTransactionBatch({
			transactions: txs,
			feeQuote: feeQuotes[0],
		});

		// sending transaction
		const txHash = await smartAccount.sendUserPaidTransaction({
			tx: transaction,
		});
		console.log("Transaction hash is", txHash);
	} catch (err) {
		console.log(err);
	}
};
