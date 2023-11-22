const { expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

// if network name is either localhost or hardhat, run test. Otherwise skip
!developmentChain.includes(network.name)
  ? describe.skip
  : describe("ReputationFactory", function () {
      let factory, deployer, account1;
      let provider1, provider2, provider3;

      // Deploys the factory contract, sets deployer and accounts before each test
      // NOTE: This implies the data at each test does not persist to the next test
      beforeEach(async function () {
        [owner, account1] = await ethers.getSigners();
        deployer = (await getNamedAccounts()).deployer;

        await deployments.fixture(["all"]);

        const factoryAddress = (await deployments.get("ReputationFactory")).address;
        factory = await ethers.getContractAt("ReputationFactory", factoryAddress);

        // Create 5 service Provider
        await factory.createServiceProvider('Provider1');
        await factory.createServiceProvider("Provider2");
        await factory.createServiceProvider("Provider3");

        provider1Address = await factory.getServiceProviderAddress("Provider1");
        provider2Address = await factory.getServiceProviderAddress("Provider2");
        provider3Address = await factory.getServiceProviderAddress("Provider3");

        provider1 = await ethers.getContractAt("ServiceProvider",provider1Address);
        provider2 = await ethers.getContractAt("ServiceProvider",provider2Address);
        provider3 = await ethers.getContractAt("ServiceProvider",provider3Address);
      });

      it("sucessfully request review token", async function () {
        // Creates service provider called "Commbank"
        await factory.createServiceProvider("Commbank");

        // Create a review token which is stored by a user (the deployer)
        const serviceProviderAddress = await factory.getServiceProviderAddress("Commbank");

        const serviceProvider = await ethers.getContractAt("ServiceProvider", serviceProviderAddress);

        // Get the tokenId from the event emitted called "Minted"
        await serviceProvider.createUserToken();
        filter = serviceProvider.filters.Minted;
        events = await serviceProvider.queryFilter(filter);
        const event = events[0];
        const status = event.args.status;

        expect(status).to.equal("transfer_success");
      });

      it("fails to create user token when account is not owner", async function () {
        // Creates service provider called "Commbank"
        await factory.createServiceProvider("test");
        const serviceProviderAddress = await factory.getServiceProviderAddress("test");
        const serviceProvider = await ethers.getContractAt("ServiceProvider", serviceProviderAddress);
        await expect(serviceProvider.connect(account1).createUserToken()).to.be.rejectedWith("Sender is not authorised");
      });

      it("fails to add review when account is not owner", async function () {
        // Creates service provider called "Commbank"
        await factory.createServiceProvider("test");
        const serviceProviderAddress = await factory.getServiceProviderAddress("test");
        const serviceProvider = await ethers.getContractAt("ServiceProvider", serviceProviderAddress);
        await expect(serviceProvider.connect(account1).sendReview(
          "0x6466647362746772736862747268000000000000000000000000000000000000",
          4,
          "Provider1",
          "0x6466647362746772736862747000000000000000000000000000000000000000"
        )).to.be.rejectedWith("Sender is not authorised");
      });

      it("fails to create a service provider when account is not owner", async function () {
        await expect(factory.connect(account1).createServiceProvider("test")).to.be.rejectedWith("Sender is not authorised");
      });

      it("successfully review multiple service provider", async function () {
        // User1 creates review for Provider1, Provider2, Provider3
        // User1 connects to contract, then user1 creates 3 review token for Provider1, Provider2, and, Provider3
        await provider1.createUserToken()
        await provider2.createUserToken()
        await provider3.createUserToken()

        // ReputationFactory emits an event called "Minted" everytime a review token is created
        // Filter those events and get the tokenId and submit a review using them
        // User1 submits review to Provider1, Provider2, and, Provider3
        filter = provider1.filters.Minted;
        events = await provider1.queryFilter(filter);
        var stat = events[0].args.status;
        expect(stat).to.equal("transfer_success");
        await provider1.sendReview("0x6466647362746772736862747268000000000000000000000000000000000000", 4, "Provider2", "0x6466647362746772736862747000000000000000000000000000000000000000")

        filter = provider2.filters.Minted;
        events = await provider2.queryFilter(filter);
        var stat = events[0].args.status;
        expect(stat).to.equal("transfer_success");
        await provider2.sendReview("0x6466647362746772736862747268000000000000000000000000000000000000", 1, "Provider1", "0x6466647362746772736862747000000000000000000000000000000000000000")

        filter = provider3.filters.Minted;
        events = await provider3.queryFilter(filter);
        var stat = events[0].args.status;
        expect(stat).to.equal("transfer_success");
        await provider3.sendReview("0x6466647362746772736862747268000000000000000000000000000000000000", 5, "Provider1", "0x6466647362746772736862747000000000000000000000000000000000000000")


        var reviews = await provider1.getReview();
        expect(reviews).to.eql([
          "0x6466647362746772736862747268000000000000000000000000000000000000",
        ]); // use "eql" here for deep equality

        var rating = await provider1.getRating();
        expect(rating).to.equal(4);


        reviews = await provider2.getReview();
        expect(reviews).to.eql([
          "0x6466647362746772736862747268000000000000000000000000000000000000",
        ]); // use "eql" here for deep equality

        rating = await provider2.getRating();
        expect(rating).to.equal(1);

        reviews = await provider3.getReview();
        expect(reviews).to.eql([
          "0x6466647362746772736862747268000000000000000000000000000000000000",
        ]); // use "eql" here for deep equality

        rating = await provider3.getRating();
        expect(rating).to.equal(5);
      });

      it("successfully transfer tokens to a service provider when review is added", async function () {
        await provider1.createUserToken();
        filter = provider1.filters.Minted;
        events = await provider1.queryFilter(filter);
        var stat = events[0].args.status;
        expect(stat).to.equal("transfer_success");

        await provider1.sendReview("0x6466647362746772736862747268000000000000000000000000000000000000", 3, "Provider2", "0x6466647362746772736862747000000000000000000000000000000000000000")
        filter = factory.filters.Transferred;
        events = await factory.queryFilter(filter);
        var stat = events[0].args.status;
        expect(stat).to.equal("transfer_success");
      });

      it("fails when using the same review token", async function () {
        await provider1.createUserToken();
        filter = provider1.filters.Minted;
        events = await provider1.queryFilter(filter);
        var stat = events[0].args.status;
        expect(stat).to.equal("transfer_success");

        await provider1.sendReview("0x6466647362746772736862747268000000000000000000000000000000000000", 3, "Provider2", "0x6466647362746772736862747000000000000000000000000000000000000000")
        filter = factory.filters.Transferred;
        events = await factory.queryFilter(filter);
        var stat = events[0].args.status;
        expect(stat).to.equal("transfer_success");

        await expect(
          provider1.sendReview("0x6466647362746772736862747268000000000000000000000000000000000000", 3, "Provider2", "0x6466647362746772736862747000000000000000000000000000000000000000")
        ).to.be.revertedWithCustomError(
          provider1,
          "ServiceProvider__InvalidReviewToken"
        );
      });

      it("fails when creating service provider of the same name", async function () {
        await factory.createServiceProvider("Alphabet");
        await expect(
          factory.createServiceProvider("Alphabet")
        ).to.be.revertedWithCustomError(
          factory,
          "ReputationFactory__DuplicateServiceProviderName"
        );
      });

      it("fails when service provider does not have enough SP token when asked to create review token", async function () {
        for (let i = 0; i < 10; i++) {
          await provider1.createUserToken();
        }
        await expect(
          provider1.createUserToken()
        ).to.be.revertedWithCustomError(
          provider1,
          "ServiceProvider__NotEnoughTokenSP"
        );
      });
    });
