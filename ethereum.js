// Ethereum blockchain integration
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(abi, contractAddress);

function recordResult(_multiplier, _result) {
  contract.methods.recordResult(_multiplier, _result).send({ from: account });
}