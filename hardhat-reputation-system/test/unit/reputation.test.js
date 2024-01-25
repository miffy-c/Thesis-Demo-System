const { expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

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

      // check that you are able to get a review token by filtering for successful transfer of tokens event 
      it("sucessfully request review token", async function () {
        await factory.createServiceProvider("Commbank");

        const serviceProviderAddress = await factory.getServiceProviderAddress("Commbank");

        const serviceProvider = await ethers.getContractAt("ServiceProvider", serviceProviderAddress);

        await serviceProvider.createUserToken();
        filter = serviceProvider.filters.Minted;
        events = await serviceProvider.queryFilter(filter);
        const event = events[0];
        const status = event.args.status;

        expect(status).to.equal("transfer_success");
      });

      // check that only the owner is able to get a review token 
      it("fails to create user token when account is not owner", async function () {
        await factory.createServiceProvider("test");
        const serviceProviderAddress = await factory.getServiceProviderAddress("test");
        const serviceProvider = await ethers.getContractAt("ServiceProvider", serviceProviderAddress);
        await expect(serviceProvider.connect(account1).createUserToken()).to.be.rejectedWith("Sender is not authorised");
      });

      // check that only the owner is able to upload a review
      it("fails to add review when account is not owner", async function () {
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

      // check that only the owner is able to create a service provider contract 
      it("fails to create a service provider when account is not owner", async function () {
        await expect(factory.connect(account1).createServiceProvider("test")).to.be.rejectedWith("Sender is not authorised");
      });

      // check that multiple reviews are added correctly and values are update accordingly in the contract 
      it("successfully review multiple service provider", async function () {
        await provider1.createUserToken()
        await provider2.createUserToken()
        await provider3.createUserToken()

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

      // check that when a review is added tokens are transferred to a selected service provider contract 
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

      // check that you are unable to submit multiple reviews for the same transaction 
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

      // check that you cannot create multiple service provider contract for one service provider 
      it("fails when creating service provider of the same name", async function () {
        await factory.createServiceProvider("Alphabet");
        await expect(
          factory.createServiceProvider("Alphabet")
        ).to.be.revertedWithCustomError(
          factory,
          "ReputationFactory__DuplicateServiceProviderName"
        );
      });

      // check that a service provider is unable to receive a review if they do not have enough tokens
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
