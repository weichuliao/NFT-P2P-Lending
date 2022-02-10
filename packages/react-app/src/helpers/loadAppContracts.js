// const contractListPromise = import("../contracts/stakingToken_contracts");
// @ts-ignore
const externalContractsPromise = import("../contracts/external_contracts");

export const loadAppContracts = async () => {
  const config = {};
  // config.deployedContracts = (await contractListPromise).default ?? {};
  config.externalContracts = (await externalContractsPromise).default ?? {};
  return config;
};
