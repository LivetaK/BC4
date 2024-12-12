let web3;
let contract;
let currentAccount;
const contractABI =  [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_bidIncrement",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "AuctionCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "AuctionFinalized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "AuctionStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "bidder",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bidAmount",
        "type": "uint256"
      }
    ],
    "name": "BidPlaced",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "bidIncrement",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "itemIds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "stateMutability": "payable",
    "type": "receive",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "startAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "cancelAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "finalizeAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "getHighestBid",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "getAuctionState",
    "outputs": [
      {
        "internalType": "enum MultiItemAuction.State",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "bidder",
        "type": "address"
      }
    ],
    "name": "getBidAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getAllAuctions",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "itemId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "highestBid",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "highestBidder",
            "type": "address"
          },
          {
            "internalType": "enum MultiItemAuction.State",
            "name": "auctionState",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct MultiItemAuction.AuctionDetails[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "getBidHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "bidder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct MultiItemAuction.Bid[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];
const contractAddress = "0x14bFDEb4888204346d289445Fa5F2F50f0c08Ff0";
const finalizeButtons = document.querySelectorAll(".finalize");
finalizeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const itemId = parseInt(button.dataset.id);
        try {
            await contract.methods.finalizeAuction(itemId).send({ from: currentAccount });
            alert(`Lėšos už aukcioną ${itemId} sėkmingai atsiimtos.`);
        } catch (error) {
            console.error(`Klaida atsiimant lėšas:`, error);
            alert(`Nepavyko atsiimti lėšų už aukcioną ${itemId}.`);
        }
    });
});


async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            currentAccount = accounts[0];
            web3 = new Web3(window.ethereum);
            contract = new web3.eth.Contract(contractABI, contractAddress);
            document.getElementById("account").innerText = `Prisijungta: ${currentAccount}`;
            updateAllAuctions();
        } catch (error) {
            console.error("MetaMask prisijungimo klaida:", error);
            alert("Nepavyko prisijungti prie MetaMask.");
        }
    } else {
        alert("MetaMask nėra įdiegtas! Prašome įdiegti MetaMask naršyklės plėtinį.");
    }
}

// Patikrinti, ar vartotojas yra kontrakto savininkas
async function checkOwner() {
    if (!contract) {
        alert("Prašome prisijungti prie MetaMask pirmiausia.");
        return;
    }
    try {
        const owner = await contract.methods.owner().call();
        if (currentAccount.toLowerCase() === owner.toLowerCase()) {
            alert("Jūs esate sutarties savininkas.");
        } else {
            alert("Jūs nesate sutarties savininkas.");
        }
    } catch (error) {
        console.error("Klaida tikrinant savininką:", error);
        alert("Nepavyko patikrinti savininko.");
    }
}

// Pateikti statymą
async function placeBid(itemId) {
    if (!contract) {
        alert("Prašome prisijungti prie MetaMask pirmiausia.");
        return;
    }

    const bidInput = prompt("Įveskite savo statymo sumą (ETH):");
    if (!bidInput) {
        alert("Statymo suma yra privaloma.");
        return;
    }

    const bidValue = parseFloat(bidInput);
    if (isNaN(bidValue) || bidValue < 0.001) {
        alert("Minimalus statymas - 0.001 ETH.");
        return;
    }

    try {
        const bidInWei = web3.utils.toWei(bidValue.toString(), "ether");
        await contract.methods.placeBid(itemId).send({ from: currentAccount, value: bidInWei });
        alert(`Statymas pateiktas: ${bidValue} ETH už aukcioną ${itemId}.`);
        updateAuction(itemId);
    } catch (error) {
        console.error(`Klaida pateikiant statymą aukcionui ${itemId}:`, error);
        alert(`Nepavyko pateikti statymo aukcionui ${itemId}.`);
    }
}

async function cancelAuction(itemId) {
    if (!contract) {
        alert("Prašome prisijungti prie MetaMask pirmiausia.");
        return;
    }

    try {
        await contract.methods.cancelAuction(itemId).send({ from: currentAccount });
        alert(`Aukcionas ${itemId} sustabdytas.`);
        updateAuctionState(itemId);
    } catch (error) {
        console.error(`Klaida stabdant aukcioną ${itemId}:`, error);
        alert(`Nepavyko sustabdyti aukciono ${itemId}.`);
    }
}

async function finalizeAuction(itemId) {
    if (!contract) {
        alert("Prašome prisijungti prie MetaMask pirmiausia.");
        return;
    }

    try {
        await contract.methods.finalizeAuction(itemId).send({ from: currentAccount });
        alert(`Aukcionas ${itemId} finalizuotas.`);
        updateAuction(itemId);
    } catch (error) {
        console.error(`Klaida finalizuojant aukcioną ${itemId}:`, error);
        alert(`Nepavyko finalizuoti aukciono ${itemId}.`);
    }
}

async function updateAuctionState(itemId) {
  try {
      const state = await contract.methods.getAuctionState(itemId).call();
      const stateText = {
          0: "Nepaleistas", // Created
          1: "Aktyvus",     // Active
          2: "Baigtas",     // Ended
          3: "Atšauktas"    // Canceled
      };
      const stateElement = document.querySelector(`.auction-state[data-id="${itemId}"]`);
      stateElement.innerText = `Būsena: ${stateText[state] || "Nežinoma"}`;
  } catch (error) {
      console.error(`Klaida atnaujinant aukciono ${itemId} būseną:`, error);
  }
}


async function updateHighestBid(itemId) {
    try {
        const highestBid = await contract.methods.getHighestBid(itemId).call();
        const highestBidETH = web3.utils.fromWei(highestBid, "ether");
        const bidElement = document.querySelector(`.highest-bid[data-id="${itemId}"]`);
        if (highestBid === "0") {
            bidElement.innerText = "Didžiausias statymas: Statymų nėra";
        } else {
            bidElement.innerText = `Didžiausias statymas: ${highestBidETH} ETH`;
        }
    } catch (error) {
        console.error(`Klaida atnaujinant aukciono ${itemId} aukščiausią statymą:`, error);
    }
}

async function startAuction(itemId) {
  if (!contract) {
      alert("Prašome prisijungti prie MetaMask pirmiausia.");
      return;
  }

  try {
      await contract.methods.startAuction(itemId).send({ from: currentAccount });
      alert(`Aukcionas ${itemId} pradėtas.`);
      updateAuction(itemId);
  } catch (error) {
      console.error(`Klaida pradedant aukcioną ${itemId}:`, error);
      alert(`Nepavyko pradėti aukciono ${itemId}.`);
  }
}


async function updateAllAuctions() {
    for (let id = 1; id <= 12; id++) {
        await updateAuction(id);
    }
}

async function updateAuction(itemId) {
  const auction = await contract.methods.getAllAuctions().call();
  const item = auction.find(a => Number(a.itemId) === itemId);

  if (item.auctionState === "0") { // 0 = Created
      document.querySelector(`.auction-state[data-id="${itemId}"]`).innerText = "Būsena: Nepaleistas";
      document.querySelector(`.highest-bid[data-id="${itemId}"]`).innerText = "Didžiausias statymas: -";
      document.querySelector(`.laikas[data-id="${itemId}"]`).innerText = "Likęs laikas: -";
      return;
  }

  await updateAuctionState(itemId);
  await updateHighestBid(itemId);
}


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("checkOwner").addEventListener("click", checkOwner);

    const finishButtons = document.querySelectorAll(".finish");
    finishButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const itemId = parseInt(button.dataset.id);
            cancelAuction(itemId);
        });
    });
    const startButtons = document.querySelectorAll(".start");
    startButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const itemId = parseInt(button.dataset.id);
            startAuction(itemId);
        });
    });
    
    const bidButtons = document.querySelectorAll(".place-bid");
    bidButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const itemId = parseInt(button.dataset.id);
            placeBid(itemId);
        });
    });

    if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                document.getElementById("account").innerText = `Prisijungta: ${currentAccount}`;
                updateAllAuctions();
            } else {
                document.getElementById("account").innerText = "Neprisijungta";
            }
        });

        window.ethereum.on("chainChanged", (chainId) => {
            window.location.reload();
        });
    }

    (async () => {
        if (window.ethereum) {
            try {
                const accounts = await ethereum.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    currentAccount = accounts[0];
                    web3 = new Web3(window.ethereum);
                    contract = new web3.eth.Contract(contractABI, contractAddress);
                    document.getElementById("account").innerText = `Prisijungta: ${currentAccount}`;
                    updateAllAuctions();
                }
            } catch (error) {
                console.error("Klaida inicijuojant sąskaitas:", error);
            }
        }
    })(); 

});