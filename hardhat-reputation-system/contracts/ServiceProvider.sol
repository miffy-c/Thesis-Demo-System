// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenSP.sol";
import "./ReputationFactory.sol";

// TODO REMOVE AFTER DEBUGGING
import "hardhat/console.sol";

error ServiceProvider__NotEnoughTokenSP();
error ServiceProvider__InvalidReviewToken();

contract ServiceProvider {
    bytes32[] private reviews;
    address private owner;
    address private factory;
    TokenSP private tokenSP;
    uint256 constant tokenSPConsumption = 10;
    uint private rating;
    mapping(bytes32 => bool) reviewTokens;

    event Minted(address indexed minter, string status);

    constructor(address _factory, address _owner) {
        owner = _owner;
        factory = _factory;
        rating = 0;
        tokenSP = new TokenSP(100);
    }

    function createUserToken() public onlyOwner {
        try tokenSP.transfer(factory, tokenSPConsumption) returns (bool) {
            emit Minted(msg.sender, "transfer_success");
        } catch (bytes memory) {
            revert ServiceProvider__NotEnoughTokenSP();
        }
    }

    function sendReview(bytes32 reviewText, uint score, string memory name, bytes32 token) public onlyOwner {
        if (reviewTokens[token] == true) {
            revert ServiceProvider__InvalidReviewToken();
        }
        reviews.push(reviewText);
        rating = score;
        reviewTokens[token] = true;
        ReputationFactory factoryContract = ReputationFactory(factory);
        factoryContract.transferTokens(name);
    }

    function getReview() public view returns (bytes32[] memory) {
        return reviews;
    }

    function getRating() public view returns (uint) {
        return rating;
    }

    modifier onlyOwner {
      require(msg.sender == owner, "Sender is not authorised");
      _;
    }
}
