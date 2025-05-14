const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function(){

  const FEE = ethers.parseUnits("0.01", 18);

 async function deployFactoryFixture() {

      // fetch deployer
      const [deployer, creator] = await ethers.getSigners(); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
      // console.log("testing",deployer,creator);
      //fetch contract
      const Factory = await ethers.getContractFactory("Factory");

     // deploy contract
     const factory = await Factory.deploy(FEE);

     // create token
     const transaction = await factory.connect(creator).create("Dapp Uni", "DAPP", {value: FEE});
     await transaction.wait(); 

     // get token address
     const tokenAddress = await factory.tokens(0); // 0xa16E02E87b7454126E5E10d957A927A7F5B5d2be
    // console.log("testing1",tokenAddress);

     const token = await ethers.getContractAt("Token", tokenAddress); // Loads the contract’s ABI and returns an instance that lets you interact with it.
          // console.log("testing2",token);

     return {factory, token, deployer, creator};
  }

  // factory -> u can access functions of factory contract;
  // token --> u can access functions of token;
  // deployer --> who deployed factory contract;
  // creator --> who creates a particular token

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

    it("Should create a sale", async function () {
      const { factory, token, creator } = await loadFixture(deployFactoryFixture)

      const count = await factory.totalTokens()
      expect(count).to.equal(1);

      const sale = await factory.getTokenSale(0);
      expect(sale.token).to.equal(await token.getAddress());
      expect(sale.sold).to.equal(0);
      expect(sale.raised).to.equal(0);
      expect(sale.isOpen).to.equal(true);
    })

  })
})
