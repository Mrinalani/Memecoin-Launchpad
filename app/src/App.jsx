import React, { useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";

// Components
import Header from "./components/Header.jsx"
import List from ".//components/List.jsx"
import Token from "./components/Token.jsx"
import Trade from "./components/Trade.jsx"

import config from "../config.json";
import Factory from "../abis/testFactory.json";
import images from "../image.json";


const App = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [token, setToken] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTrade, setShowTrade] = useState(false);

    function toggleCreate() {
    showCreate ? setShowCreate(false) : setShowCreate(true)
  }

  function toggleTrade(token) {
    setToken(token)
    showTrade ? setShowTrade(false) : setShowTrade(true)
  }


  const connectWallet = async () => {
     const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)
        console.log("wallet connected successfully")
    console.log("provider", provider)


    // Get the current network
    const network = await provider.getNetwork()
        console.log("networ", network.chainId)


    // Create reference to Factory contract
    const factory = new ethers.Contract(config[network.chainId].factory.address, Factory.abi, provider)
    setFactory(factory)
    console.log(factory)

    // Fetch the fee
    const fee = await factory.FEE()
    console.log("fee = ",fee)
    console.log("testing")
    setFee(fee)

    // Prepare to fetch token details
    const totalTokens = await factory.totalTokens()
    const tokens = []

    // We'll get the first 6 tokens listed
    for (let i = 0; i < totalTokens; i++) {
      if (i == 6) {
        break
      }

      const tokenSale = await factory.getToken(i)

      // We create our own object to store extra fields
      // like images
      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: images[i]
      }

      tokens.push(token)
    }

    // We reverse the array so we can get the most
    // recent token listed to display first
    setTokens(tokens.reverse())
  };

  useEffect(() => {
    connectWallet();
  }, [showCreate, showTrade]);

 return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />

      <main>
        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy">
            {!factory ? (
              "[ contract not deployed ]"
            ) : !account ? (
              "[ please connect ]"
            ) : (
              "[ start a new token ]"
            )}
          </button>
        </div>

        <div className="listings">
          <h1>new listings</h1>

          <div className="tokens">
            {!account ? (
              <p>please connect wallet</p>
            ) : tokens.length === 0 ? (
              <p>No tokens listed</p>
            ) : (
              tokens.map((token, index) => (
                <Token
                  toggleTrade={toggleTrade}
                  token={token}
                  key={index}
                />
              ))
            )}
          </div>
        </div>

        {showCreate && (
          <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
        )}

        {showTrade && (
          <Trade toggleTrade={toggleTrade} token={token} provider={provider} factory={factory} />
        )}
      </main>
    </div>
  );
}

export default App;
