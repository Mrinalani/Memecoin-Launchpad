// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import "./Token.sol";

contract TestFactory {
    uint256 public immutable FEE;
    address public immutable owner;
    uint256 public totalTokens;
    address[] public tokens;
    uint256  public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    mapping(address => TokenSale) public tokenToSale;

    constructor(uint256 _fee) {
        FEE = _fee;
        owner = msg.sender;
    }

    event created(address indexed token);
    event buyToken(address indexed token, uint256 amount);
    
    function getToken(uint256 _index) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

     function getCost(uint256 _sold) public pure returns(uint256) {
        uint256 floor = 0.0001 ether; 
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;
        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(string memory _name, string memory _symbol) public payable {
        // Make sure that fee is correct
        require(msg.value == FEE, "Insufficient Fee");

        // token create
        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);

        // token save
        tokens.push(address(token));
        totalTokens++;

        // list the token
        TokenSale memory sale = TokenSale( address(token),_name,msg.sender,0,0,true);

        tokenToSale[address(token)] = sale;

        // Tell people its live
        emit created(address(token));
    }

    function buy(address _token, uint256 _amount) external payable {

        TokenSale storage sale = tokenToSale[_token];

        require(sale.isOpen == true, "Sale is closed");
        require(_amount >= 1 ether, "Amount is low");
        require(_amount <= 10000 ether, "Amout exceeded");

        uint256 cost = getCost(sale.sold);
        uint256 price = cost * (_amount / 10 ** 18);

        require(msg.value >= price, "Insufficient ETH received");

        sale.raised += price;
        sale.sold += _amount;

        if(sale.raised >= TARGET|| sale.sold >= TOKEN_LIMIT){
            sale.isOpen = false;
        }

        Token(_token).transfer(msg.sender, _amount);

        emit buyToken(_token, _amount);

    }

    function deposit(address _token) public {

        Token token = Token(_token);

        TokenSale memory sale = tokenToSale[_token];
        require(sale.isOpen == false, "Sale is not close yet");

        // transfer left over tokens to the creator
        token.transfer(sale.creator, token.balanceOf(address(this)));

        // transfer eth raised to the creator
        (bool success,) = payable(sale.creator).call{value: sale.raised}("");
        require(success, "failed to transfer");

    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == owner, "Only owner can withdraw amount");

         (bool success,) = payable(owner).call{value: _amount}("");
        require(success, "failed to transfer");
        
    }

    
}
