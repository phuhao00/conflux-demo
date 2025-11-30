require('dotenv').config();
const { ethers } = require('ethers');

async function check() {
    const key = process.env.RELAYER_PRIVATE_KEY;
    if (!key) {
        console.log("No RELAYER_PRIVATE_KEY found in .env");
        return;
    }
    const wallet = new ethers.Wallet(key);
    console.log("Current .env Address:", wallet.address);

    const deployment = require('../data/deployment.json');
    console.log("Contract Deployer:   ", deployment.deployerAddress);

    if (wallet.address.toLowerCase() === deployment.deployerAddress.toLowerCase()) {
        console.log("✅ MATCH: Server is using the contract owner wallet.");
    } else {
        console.log("❌ MISMATCH: Server is NOT using the contract owner wallet!");
        console.log("This is why minting fails. You must use the same key that deployed the contract.");
    }
}

check();
