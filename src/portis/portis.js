import Portis from "@portis/web3";
// import Web3 from "web3";

const NodeUsed = "ropsten";

export const portis = new Portis(
  "2650813c-a25d-4f11-862a-6c00530d0dbc",
  NodeUsed,
  {
    scope: ["email"],
  }
);

// const web3 = new Web3(portis.provider);

// export { portis, web3 };
