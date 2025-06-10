const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const FEE = ethers.parseUnits("0.1", 18);

const deployTestFactoryFixture = async () => {
  const [deployer, creator, buyer] = await ethers.getSigners();
  const TestFactory = await ethers.getContractFactory("TestFactory");
  const testFactory = await TestFactory.deploy(FEE);

  const factoryToken = await testFactory
    .connect(creator)
    .create("My First Token", "MFT", { value: FEE });
  await factoryToken.wait();

  const tokenAddress = await testFactory.tokens(0);
  const token = await ethers.getContractAt("Token", tokenAddress);

  return { testFactory, deployer, token, creator, buyer };
};

const buyTokenFixture = async () => {
  const { testFactory, token, creator, buyer } = await loadFixture(
    deployTestFactoryFixture
  );

  const amount = ethers.parseUnits("10000", 18);
  const cost = ethers.parseUnits("1", 18);

  const buyToken = await testFactory
    .connect(buyer)
    .buy(await token.getAddress(), amount, { value: cost });
  await buyToken.wait();

  return { testFactory, token, creator, buyer };
};

describe("creating", () => {
  it("should set the owner", async () => {
    const { token, testFactory } = await loadFixture(deployTestFactoryFixture);
    expect(await token.owner()).to.equal(await testFactory.getAddress());
  });

  it("should set the creator", async () => {
    const { token, creator } = await loadFixture(deployTestFactoryFixture);
    expect(await token.creator()).to.equal(creator.address);
  });

  it("should set the totalSupply", async () => {
    const { token, testFactory } = await loadFixture(deployTestFactoryFixture);
    const balance = ethers.parseUnits("1000000", 18);
    expect(await token.totalSupply()).to.equal(balance);
  });

  it("should update ETH balance", async () => {
    const { testFactory } = await loadFixture(deployTestFactoryFixture);
    const balance = await ethers.provider.getBalance(
      await testFactory.getAddress()
    );
    expect(FEE).to.equal(balance);
  });

  // it("should create the sale", async () => {
  //   const { testFactory } = await loadFixture(deployTestFactoryFixture);
  //   expect(await testFactory.totalTokens()).to.equal(1);
  // });

  // it("should create the sale", async() => {
  //   const { token, testFactory } = await loadFixture(deployTestFactoryFixture);
  //   const sale = await testFactory.tokenToSale(await token.getAddress());
  //   expect(await token.getAddress()).to.equal(sale.token)
  // })

  it("should create the sale", async () => {
    const { token, testFactory, creator } = await loadFixture(
      deployTestFactoryFixture
    );
    const sale = await testFactory.getToken(0);
    console.log(sale);
    expect(await token.getAddress()).to.equal(sale.token);
    expect(creator).to.equal(sale.creator);
    expect("My First Token").to.equal(sale.name);
    expect(0).to.equal(sale.sold);
    expect(0).to.equal(sale.raised);
    expect(true).to.equal(sale.isOpen);
  });
});

describe("buying", async () => {
  const amount = ethers.parseUnits("10000", 18);
  const cost = ethers.parseUnits("1", 18);

  // check factory contract receive ETH
  it("should update ETH balance", async () => {
    const { testFactory } = await loadFixture(buyTokenFixture);
    const contractBalance = await ethers.provider.getBalance(
      testFactory.getAddress()
    );
    expect(contractBalance).to.equal(cost + FEE);
  });

  // check buyer recieve token

  it("should update the token balance", async () => {
    const { token, buyer } = await loadFixture(buyTokenFixture);

    const buyerBalance = await token.balanceOf(buyer);
    expect(buyerBalance).to.equal(amount);
  });

  it("should update token sold", async () => {
    const { testFactory } = await loadFixture(buyTokenFixture);
    const sale = await testFactory.getToken(0);
    expect(amount).to.equal(sale.sold);
    expect(cost).to.equal(sale.raised);
    expect(sale.isOpen).to.equal(true);
  });

  it("should increase base cost", async () => {
    const { testFactory } = await loadFixture(buyTokenFixture);
    const sale = await testFactory.getToken(0);
    const cost = await testFactory.getCost(sale.sold);

    expect(cost).to.equal(ethers.parseUnits("0.0002"));
  });
});

describe("depositing", async () => {
  const amount = ethers.parseUnits("10000", 18);
  const cost = ethers.parseUnits("2", 18);

  it("sale should be closed and successfully deposit", async() => {
    const { testFactory, buyer, token, creator } = await loadFixture(buyTokenFixture);

  const buyToken = await testFactory.connect(buyer).buy(await token.getAddress(), amount, { value: cost });
  await buyToken.wait();

  const sale = await testFactory.tokenToSale(await token.getAddress());

  expect(sale.isOpen).to.equal(false);

  const deposit = await testFactory.connect(creator).deposit(token.getAddress());
  await deposit.wait();

  const creatorBalance = await token.balanceOf(creator);
  expect(creatorBalance).to.equal(ethers.parseUnits("980000", 18));
  })

})

describe("withdrawing", async () => {
  it("should withdraw ETH balance", async () => {
  const { testFactory, deployer } = await loadFixture(deployTestFactoryFixture);

  const withdraw = await testFactory.connect(deployer).withdraw(FEE);
  await withdraw.wait();

  const contractBalance = await ethers.provider.getBalance(await testFactory.getAddress());

  expect(contractBalance).to.equal(0);
  })
})
