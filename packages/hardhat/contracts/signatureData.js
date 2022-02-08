const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];
const set = [
    { name: "borrower", type: "address" },
    { name: "principal", type: "uint" },
    { name: "repayment", type: "uint" },
    { name: "currency", type: "address" },
    { name: "deadline", type: "uint" },
    { name: "nft", type: "address" },
];
const domainData = {
    name: "CuterDAO",
    version: "1",
    chainId: "1",    // ethers 可以拿到再放進來
    verifyingContract: "0x3333333333333333333333333333333333333333",
};
const setData = {
    borrower: "0x3333333333333333333333333333333333333333",    // 借款的錢包地址
    principal: 100,    // 借多少
    repayment: 105,  // 還多少
    currency: "0x3333333333333333333333333333333333333333",    // 借款 token address
    deadline: 12345678,    // 還款時間
    nft: "0x3333333333333333333333333333333333333333",    // NFT token ID
}
const data = JSON.stringify({
    types: {
        EIP712Domain: domain,
        set: set
    },
    domain: domainData,
    primaryType: "set",
    message: setData
});