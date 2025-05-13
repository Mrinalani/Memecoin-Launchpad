const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function(){

  const FEE = ethers.parseUnits("0.01", 18);

 async function deployFactoryFixture() {

      // fetch deployer
      const [deployer, creator] = await ethers.getSigners();
      //fetch contract
      const Factory = await ethers.getContractFactory("Factory");

     // deploy contract
     const factory = await Factory.deploy(FEE);

     // create token
     const transaction = await factory.connect(creator).create("Dapp Uni", "DAPP", {value: FEE});
     await transaction.wait;

     // get token address
     const tokenAddress = await factory.tokens(0);
     const token = await ethers.getContractAt("Token", tokenAddress); // Loads the contract’s ABI and returns an instance that lets you interact with it.

     return {factory, token, deployer, creator};
  }

  describe("Deployment", function() {
    it("should set the fee", async function() {
      const {factory} = await loadFixture(deployFactoryFixture);

      const fee = await factory.fee()

      expect(fee).to.equal(FEE);
    })

    it("should set the owner", async function() {
      const {factory, deployer} = await loadFixture(deployFactoryFixture);

      const owner = await factory.owner()

      expect(deployer.address).to.equal(owner);
    })

  })

  describe("Creating", function () {
    it("should set the owner", async function() {
      const { factory, token } = await loadFixture(deployFactoryFixture)
      expect(await token.owner()).to.equal(await factory.getAddress())
    })

    it("Should set the creator", async function () {
    const { token, creator } = await loadFixture(deployFactoryFixture)
    expect(await token.creator()).to.equal(creator.address)
    })

    it("Should set the supply", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture)

      const totalSupply = ethers.parseUnits("1000000", 18)

      expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupply)
    })

    it("Should update ETH balance", async function () {
      const { factory } = await loadFixture(deployFactoryFixture)

      const balance = await ethers.provider.getBalance(await factory.getAddress())

      expect(balance).to.equal(FEE)
    })

  })
})
