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

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function create(string memory _name, string memory _symbol) external payable {
        // create a token
        Token token = new Token(msg.sender, _name, _symbol, 1000_000 ether);

        // save token for later use
        tokens.push(address(token));
        totalTokens++;
    }
}
