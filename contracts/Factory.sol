// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import {Token} from "./Token.sol";

import "hardhat/console.sol";

contract Factory {
    // string public name = "Factory";
    // string public anotherName = "AnotherFactory";

    uint256 public immutable fee;
    address public owner;

    address[] public tokens;
    uint256 public totalTokens;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint sold;
        uint raised;
        bool isOpen;
    }

    mapping(address => TokenSale) public tokenToSale;

    event Created(address indexed token);
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(uint _index) public view returns(TokenSale memory){
        return tokenToSale[tokens[_index]];
    }

    function create(string memory _name, string memory _symbol) external payable {

        require(msg.value == fee, "Factory: Creator fee not met");

        // create a token
        Token token = new Token(msg.sender, _name, _symbol, 1000_000 ether);

        // save token for later use
        tokens.push(address(token));
        totalTokens++;

        // List the token for sale
    TokenSale memory sale = TokenSale (
        address(token),
        _name,
        msg.sender,
        0,
        0,
        true
    );

    tokenToSale[address(token)] = sale;

    
    // Tell people it's live
    emit Created(address(token));
    }

    function buy(address _token, uint _amount) external payable{

        // update the sale
        TokenSale storage sale = tokenToSale[_token];

        sale.sold += _amount;

        Token(_token).transfer(msg.sender, _amount);

        emit Buy(_token, _amount);
    }
}
