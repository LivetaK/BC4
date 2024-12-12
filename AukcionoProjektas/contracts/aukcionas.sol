// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract MultiItemAuction {
    address payable public owner;
    uint public bidIncrement;

    enum State { Created, Active, Ended, Canceled }

    struct Bid {
        address bidder;
        uint amount;
    }

    struct Item {
        uint highestBindingBid;
        address payable highestBidder;
        State auctionState;
        mapping(address => uint) bids;
        Bid[] bidHistory;
        uint startTime;
        uint endTime;
    }

    mapping(uint => Item) private itemsMap; // Aukcionų saugojimas pagal ID
    uint[] public itemIds;

    // Įvykių deklaracijos
    event AuctionStarted(uint indexed itemId, uint startTime, uint endTime);
    event AuctionCanceled(uint indexed itemId);
    event BidPlaced(uint indexed itemId, address indexed bidder, uint bidAmount);
    event AuctionFinalized(uint indexed itemId, address indexed recipient, uint value);

    // Modifikatoriai
    modifier notOwner() {
        require(msg.sender != owner, "Savininkas negali statyti");
        _;
    }

    modifier auctionActive(uint itemId) {
        require(itemsMap[itemId].auctionState == State.Active, "Aukcionas neveikia");
        require(block.timestamp >= itemsMap[itemId].startTime, "Aukcionas neprasidejo");
        require(block.timestamp <= itemsMap[itemId].endTime, "Aukcionas baigesi");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Tik savininkas gali atlikti veiksma");
        _;
    }

    constructor(uint _bidIncrement) {
        require(_bidIncrement > 0, "Statymo padidinimas turi buti didesnis nei 0");
        owner = payable(msg.sender);
        bidIncrement = _bidIncrement;

        for (uint i = 1; i <= 12; i++) {
            itemIds.push(i);
            initializeItem(i);
        }
    }

    function initializeItem(uint itemId) internal {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        Item storage item = itemsMap[itemId];
        // Gali būti, kad kontraktas iškviečiamas tik kartą konstruktoriaus metu,
        // todėl papildomų patikrinimų, ar jis jau sukurtas, neprireiks.
        // Jei visgi norite, galite pridėti require, kad būsenos keisti negalima jei jau sukurta.
        
        item.highestBindingBid = 0;
        item.highestBidder = payable(address(0));
        item.auctionState = State.Created;
        // startTime ir endTime bus nustatyti kai bus kviečiamas startAuction
    }

    // Funkcija pradėti aukcioną
    function startAuction(uint itemId) public onlyOwner {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        Item storage item = itemsMap[itemId];
        require(item.auctionState == State.Created, "Aukcionas turi buti Created busenoje");
        
        item.auctionState = State.Active;
        item.startTime = block.timestamp;
        item.endTime = block.timestamp + 20 minutes; // Aukciono trukmė: 20 minučių
        
        emit AuctionStarted(itemId, item.startTime, item.endTime);
    }

    // Stabdyti aukcioną
    function cancelAuction(uint itemId) public onlyOwner {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        Item storage item = itemsMap[itemId];
        require(item.auctionState == State.Active, "Aukcionas turi buti Active busenoje, kad ji stabdytum");
        require(block.timestamp < item.endTime, "Aukcionas jau baigesi");

        item.auctionState = State.Canceled;
        emit AuctionCanceled(itemId);
    }

    // Pateikti statymą
    function placeBid(uint itemId) public payable notOwner auctionActive(itemId) {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        Item storage item = itemsMap[itemId];
        require(msg.value >= 0.001 ether, "Minimalus statymas yra 0.001 ETH");

        uint currentBid = item.bids[msg.sender] + msg.value;
        require(currentBid >= item.highestBindingBid + bidIncrement, "Statymo padidinimas per mazas");

        // Registruojame statymą
        item.bids[msg.sender] = currentBid;
        item.bidHistory.push(Bid({
            bidder: msg.sender,
            amount: msg.value
        }));

        if (currentBid > item.bids[item.highestBidder]) {
            item.highestBindingBid = min(currentBid, item.bids[item.highestBidder] + bidIncrement);
            item.highestBidder = payable(msg.sender);
        } else {
            item.highestBindingBid = min(currentBid + bidIncrement, item.bids[item.highestBidder]);
        }

        emit BidPlaced(itemId, msg.sender, msg.value);
    }

    // Finalizuoti aukcioną
    function finalizeAuction(uint itemId) public {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        Item storage item = itemsMap[itemId];
        require(
            item.auctionState == State.Canceled || block.timestamp > item.endTime,
            "Aukcionas dar neveikia arba nera atsauktas"
        );
        require(
            msg.sender == owner || item.bids[msg.sender] > 0,
            "Tik savininkas arba statymus pateike asmenys gali finalizuoti"
        );

        address payable recipient;
        uint value;

        if (item.auctionState == State.Canceled) {
            // Jei aukcionas atsauktas, bet kuris dalyvis gali išsiimti savo statymus
            require(item.bids[msg.sender] > 0, "Jums nera ko atsiimti");
            recipient = payable(msg.sender);
            value = item.bids[msg.sender];
        } else {
            // Jei aukcionas baigtas
            if (msg.sender == owner) {
                recipient = owner;
                value = item.highestBindingBid;
            } else if (msg.sender == item.highestBidder) {
                recipient = item.highestBidder;
                value = item.bids[item.highestBidder] - item.highestBindingBid;
            } else {
                // Kiti dalyviai gali išsiimti savo statymus
                require(item.bids[msg.sender] > 0, "Jums nera ko atsiimti");
                recipient = payable(msg.sender);
                value = item.bids[msg.sender];
            }
        }

        item.bids[recipient] = 0;

        (bool success, ) = recipient.call{value: value}("");
        require(success, "Pervedimas nepavyko");

        if (block.timestamp > item.endTime && item.auctionState == State.Active) {
            item.auctionState = State.Ended;
        }

        emit AuctionFinalized(itemId, recipient, value);
    }

    // Gauti aukciono aukščiausią statymą
    function getHighestBid(uint itemId) public view returns (uint) {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        return itemsMap[itemId].highestBindingBid;
    }

    // Gauti aukciono būseną
    function getAuctionState(uint itemId) public view returns (State) {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        return itemsMap[itemId].auctionState;
    }

    // Gauti statymą pagal aukciono ID ir dalyvio adresą
    function getBidAmount(uint itemId, address bidder) public view returns (uint) {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        return itemsMap[itemId].bids[bidder];
    }

    struct AuctionDetails {
        uint itemId;
        uint highestBid;
        address highestBidder;
        State auctionState;
        uint startTime;
        uint endTime;
    }

    function getAllAuctions() public view returns (AuctionDetails[] memory) {
        AuctionDetails[] memory auctions = new AuctionDetails[](itemIds.length);
        for(uint i = 0; i < itemIds.length; i++) {
            uint id = itemIds[i];
            auctions[i] = AuctionDetails({
                itemId: id,
                highestBid: itemsMap[id].highestBindingBid,
                highestBidder: itemsMap[id].highestBidder,
                auctionState: itemsMap[id].auctionState,
                startTime: itemsMap[id].startTime,
                endTime: itemsMap[id].endTime
            });
        }
        return auctions;
    }

    // Gauti aukciono istoriją
    function getBidHistory(uint itemId) public view returns (Bid[] memory) {
        require(itemId > 0 && itemId <= 12, "Netinkamas aukciono ID");
        return itemsMap[itemId].bidHistory;
    }

    // Minimalios funkcijos pavyzdys
    function min(uint a, uint b) private pure returns (uint) {
        return a <= b ? a : b;
    }

    // Atmetame tiesioginius pervedimus
    receive() external payable {
        revert("Tiesioginiai pervedimai neleidziami");
    }
}
