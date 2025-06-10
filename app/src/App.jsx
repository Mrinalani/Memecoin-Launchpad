import React, { useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import Header from "./components/Header.jsx";
import config from "../config.json";
import Factory from "../abis/testFactory.json";

const App = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const network = await browserProvider.getNetwork();
        console.log(network.chainId, "network");

        console.log(Factory.abi, "ABI");

        console.log(config[network.chainId].factory.address, "contract address");

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const factory = new ethers.Contract(config["31337"].factory.address, Factory.abi, browserProvider);
        console.log(factory);
        console.log(await factory.FEE());

      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask wallet not installed");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div>
      <Header account={account} setAccount={setAccount} />
    </div>
  );
};

export default App;
