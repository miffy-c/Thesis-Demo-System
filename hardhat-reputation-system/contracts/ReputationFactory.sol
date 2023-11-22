// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenSP.sol";
import "./ServiceProvider.sol";

import "hardhat/console.sol";

error ReputationFactory__DuplicateServiceProviderName();
error ReputationFactory__ServiceProviderDoesNotExist();


contract ReputationFactory {
    mapping(string => address) private registry;
    address private owner;
    TokenSP private tokenFactory;

    event Transferred(string status);

    constructor() {
        owner = msg.sender;
        tokenFactory = new TokenSP(1000);
    }

    function createServiceProvider(string memory name) public onlyOwner {
        // Check if the service provider name has already been registered
        if (registry[name] != address(0)) {
            revert ReputationFactory__DuplicateServiceProviderName();
        }
        ServiceProvider serviceProvider = new ServiceProvider(address(this), owner);
        registry[name] = address(serviceProvider);
    }

    // returns the address for the given name of the service provider
    function getServiceProviderAddress(string memory name) public view returns (address) {
        return registry[name];
    }

    // returns the service provider contract given the name of the service provider
    function getServiceProvider(string memory name) public view returns (ServiceProvider) {
        address spAddress = getServiceProviderAddress(name);
        if (spAddress == address(0)) {
            revert ReputationFactory__ServiceProviderDoesNotExist();
        }
        return ServiceProvider(spAddress);
    }

    function transferTokens(string memory name) public {
        tokenFactory.transfer(getServiceProviderAddress(name), 10);
        emit Transferred("transfer_success");
    }

    modifier onlyOwner {
      require(msg.sender == owner, "Sender is not authorised");
      _;
    }

}
