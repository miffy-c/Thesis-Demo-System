// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

// From OpenZeppelin Documentation:
// https://docs.openzeppelin.com/contracts/4.x/erc20

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSP is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("ServiceProvider", "SP") {
        _mint(msg.sender, initialSupply);
    }
}
