// Imports the Alchemy SDK
//https://ethereum.stackexchange.com/questions/25833/rawtransaction-and-contractaddress
//https://ethereum.stackexchange.com/questions/59692/deploying-contract-with-arguments-using-raw-transaction
//https://ethereum.stackexchange.com/questions/35720/how-to-build-and-sign-a-transaction-to-deploy-a-contract

const { Network, Alchemy, Wallet, Utils } = require("alchemy-sdk")
const fs = require('fs');
const { Web3 } = require('web3');

const dotenv = require("dotenv");
dotenv.config();
const { API_KEY, ALCHEMY_URL, DEPLOYER_PRIVATE_KEY, RUNNER_PRIVATE_KEY } = process.env;

const main = async () => {
    const web3 = new Web3(ALCHEMY_URL);

    const settings = {
        apiKey: API_KEY,
        network: Network.ETH_MAINNET, // Replace with your network.
    };
    const chainId = 1; // Replace with your network.

    const alchemy = new Alchemy(settings);
    const deployer = new Wallet(DEPLOYER_PRIVATE_KEY);
    const runner = new Wallet(RUNNER_PRIVATE_KEY);

    const bytecode = fs.readFileSync('contract.bin').toString();
    const abicode = fs.readFileSync('contract.abi').toString();

    let contract = new web3.eth.Contract(JSON.parse(abicode));
    let deployTx = contract.deploy({data: bytecode});

    console.log('runner', await runner.getAddress());
    console.log('deployer', await deployer.getAddress());

    console.log('Start eth transfer to deployer');

    let txCount = await alchemy.core.getTransactionCount(
        runner.getAddress()
    );
    console.log('runner txCount #1: ', txCount);
    let currentGasInHex = await alchemy.core.getGasPrice()

    let transaction = {
        to: deployer.getAddress(),
        value: Utils.parseEther("0.00001"),
        gasLimit: "21000",
        maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
        // maxFeePerGas: Utils.parseUnits("20", "gwei"),
        maxFeePerGas: currentGasInHex,
        gasPrice: currentGasInHex,
        nonce: txCount,
        type: 2,
        chainId: chainId, // Corresponds to ETH_MAINNET
    };

    let rawTransaction = await runner.signTransaction(transaction);
    // let tx = await alchemy.transact.sendTransaction(rawTransaction);
    //let tx = await alchemy.transact.sendPrivateTransaction(rawTransaction);
    const signedTx = await alchemy.transact.sendPrivateTransaction(
        rawTransaction,
        (await alchemy.core.getBlockNumber()) + 1
    );
    console.log("signedTx", signedTx);
    //await alchemy.transact.waitForTransaction(tx.hash);


    let txDeployerCount = await alchemy.core.getTransactionCount(
        deployer.getAddress()
    );
    console.log('deployer txCount #1: ', txDeployerCount);

    // console.log('Transfer ETH from deployer');
    // transaction = {
    //     to: runner.getAddress(),
    //     value: Utils.parseEther("0.001"),
    //     gasLimit: "21000",
    //     maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
    //     maxFeePerGas: Utils.parseUnits("20", "gwei"),
    //     nonce: txDeployerCount,
    //     type: 2,
    //     chainId: chainId, // Corresponds to ETH_MAINNET
    // };
    // rawTransaction = await deployer.signTransaction(transaction);
    // tx = alchemy.transact.sendTransaction(rawTransaction);
    // //!!!! let tx = alchemy.transact.sendPrivateTransaction(rawTransaction);
    //
    // console.log('Contract deploy from deployer');
    // txDeployerCount = txDeployerCount + 1;
    //
    // let currentGasInHex = await alchemy.core.getGasPrice();
    //
    // transaction = {
    //     from: deployer.getAddress(),
    //     gasPrice: currentGasInHex * Number(2),
    //     gasLimit: 0x61A80,
    //     nonce: txDeployerCount,
    //     data: deployTx.encodeABI(),
    //     chainId: chainId, // Corresponds to ETH_MAINNET
    // };
    //
    // rawTransaction = await deployer.signTransaction(transaction);
    // tx = await alchemy.transact.sendTransaction(rawTransaction);
    // //!!!! let tx = alchemy.transact.sendPrivateTransaction(rawTransaction);
    // console.log('tx', tx);
    // console.log('The process finished');


    // const txHash = "0x2e8dff1ae477808ec0682c27fbdd250a2e628090fe4e901e644c942628113b37"
    // const response = await alchemy.transact.cancelPrivateTransaction(txHash)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


