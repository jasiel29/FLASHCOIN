import React, { useEffect, useState } from "react";
import TronWeb from "tronweb";

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const OWNER_ADDRESS = "YOUR_OWNER_WALLET_ADDRESS";

function App() {
  const [tronWeb, setTronWeb] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const initTronWeb = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronWeb(window.tronWeb);
        const addr = window.tronWeb.defaultAddress.base58;
        setAccount(addr);
      } else {
        setStatus("Please install and login to TronLink");
      }
    };
    initTronWeb();
  }, []);

  useEffect(() => {
    if (account && account.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [account]);

  const fetchBalance = async () => {
    if (!tronWeb) return;
    try {
      const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
      const bal = await contract.balanceOf(account).call();
      setBalance(tronWeb.fromSun(bal));
    } catch (err) {
      setStatus("Error fetching balance: " + err.message);
    }
  };

  useEffect(() => {
    if (account) fetchBalance();
  }, [account]);

  const sendTokens = async () => {
    if (!tronWeb) {
      setStatus("TronWeb not initialized");
      return;
    }
    if (!recipient || !amount) {
      setStatus("Enter recipient and amount");
      return;
    }
    try {
      const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
      const sendAmount = tronWeb.toBigNumber(amount).times(1e6).toFixed(0);
      setStatus("Sending tokens...");
      const tx = await contract.transfer(recipient, sendAmount).send({
        feeLimit: 100_000_000,
      });
      setStatus("Transaction sent! TXID: " + tx);
      setRecipient("");
      setAmount("");
      fetchBalance();
    } catch (err) {
      setStatus("Send failed: " + err.message);
    }
  };

  const mintDailyTokens = async () => {
    if (!tronWeb || !isOwner) {
      setStatus("Only owner can mint tokens");
      return;
    }
    if (!mintAmount) {
      setStatus("Enter mint amount");
      return;
    }
    try {
      const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
      const amountBN = tronWeb.toBigNumber(mintAmount).times(1e6).toFixed(0);
      setStatus("Minting tokens...");
      const tx = await contract.mintDaily(account, amountBN).send({ feeLimit: 100_000_000 });
      setStatus("Mint transaction sent! TXID: " + tx);
      setMintAmount("");
      fetchBalance();
    } catch (err) {
      setStatus("Mint failed: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>FlashCoin TRC20 Wallet</h1>
      <p>
        <b>Connected Account:</b> {account || "Not connected"}
      </p>
      <p>
        <b>FlashCoin Balance:</b> {balance}
      </p>

      <h2>Send FlashCoin</h2>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button onClick={sendTokens} style={{ padding: "10px 20px" }}>
        Send Tokens
      </button>

      {isOwner && (
        <>
          <h2>Mint Daily Tokens</h2>
          <input
            type="number"
            placeholder="Amount to mint"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <button onClick={mintDailyTokens} style={{ padding: "10px 20px" }}>
            Mint Tokens
          </button>
        </>
      )}

      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  );
}

export default App;