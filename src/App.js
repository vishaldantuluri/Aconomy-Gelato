import React, { Component } from "react";
import "./App.css";
import piNFTAbi from "./piNFT.json";
import piNFTMethodsAbi from "./piNFTMethods.json";
import { GelatoRelay, SponsoredCallERC2771Request } from "@gelatonetwork/relay-sdk"
import Web3 from "web3";
import { ethers } from "ethers";
require('dotenv').config()
const relay = new GelatoRelay();


//goerli: 0x2dB5435b2d73fcdAcEB0FBe84F252227768CAA23
//polygon: 0x792868DFfa49363dBA55cB3A9F50B6785408E8a6

const addresspiNft = "0xFbeEB6442454b55F487263C088C4BD821eAB6A49";
const addresspiNftMethods = "0x6EE3F06853F0076ff585E3EFD2fA88bAAf567811"
const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const chain_Id = 5;
const gelatoapiGoerli = process.env.REACT_APP_GELATO_GOERLI;

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  // async loadBlockchainData() {
  //   const web3 = window.web3;
  //   const account = await window.ethereum.selectedAddress;
  //   this.setState({ account });

  //   const abiPNDC = PNDC_ERC721.abi;

  //   const contractPNDC = new web3.eth.Contract(abiPNDC, addresspndc);

  //   this.setState({ contractPNDC });
  // }

  constructor(props) {
    super(props);
    this.state = {
      contractPNDC: null,
      biconomyPNDC: null,
      account: null,
      address: null,
      collection: null,
      validator: null,
      id: null,
      appId: null,
      owner: null,
    };
  }

  captureValidator = async (event) => {
    event.preventDefault();

    console.log("capturing collection");
    const validator = event.target.value;
    this.setState({ validator });

    const account = await window.ethereum.selectedAddress;
    this.setState({ account });
  }

  captureCollection = async (event) => {
    event.preventDefault();

    console.log("capturing collection");
    const collection = event.target.value;
    this.setState({ collection });

    const account = await window.ethereum.selectedAddress;
    this.setState({ account });
  }

  captureId = async (event) => {
    event.preventDefault();

    console.log("capturing Id");
    const id = event.target.value;
    this.setState({ id });

    const account = await window.ethereum.selectedAddress;
    this.setState({ account });
  };

  onLazyMint = async (event) => {
    event.preventDefault();

    const account = await window.ethereum.selectedAddress;
    this.setState({ account });

    const royalties = [[account, 1000]];
    console.log(account);
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner();
    const user = signer.getAddress();

    const contract = new ethers.Contract(addresspiNft, piNFTAbi, signer);
    const { data } = await contract.populateTransaction.lazyMintNFT(account, "xyz", royalties);

    const request = {
      chainId: 5,
      target: addresspiNft,
      data: data,
      user: account,
    };

    console.log(`Sending Lazy mint transaction tx to Gelato Relay...`);

    const relayResponse = await relay.sponsoredCallERC2771(request, provider, gelatoapiGoerli);

    console.log(relayResponse);
  };

  onAddValidator = async (event) => {
    event.preventDefault();

    const account = await window.ethereum.selectedAddress;
    this.setState({ account });

    const id = this.state.id;
    const collection = this.state.collection;
    const validator = this.state.validator

    const royalties = [[account, 1000]];
    console.log(account);
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner();
    const user = signer.getAddress();

    const contract = new ethers.Contract(addresspiNftMethods, piNFTMethodsAbi, signer);
    const { data } = await contract.populateTransaction.lazyAddValidator(collection, id, validator);

    const request = {
      chainId: 5,
      target: addresspiNftMethods,
      data: data,
      user: account,
    };

    console.log(`Sending Lazy mint transaction tx to Gelato Relay...`);

    const relayResponse = await relay.sponsoredCallERC2771(request, provider, gelatoapiGoerli);

    console.log(relayResponse);
  }

  onOwnerCall = async (event) => {
    event.preventDefault();

    const account = await window.ethereum.selectedAddress;
    this.setState({ account });

    const id = this.state.id;

    await this.state.contractPNDC.methods
      .ownerOf(id)
      .call({ from: account })
      .then((owner) => {
        console.log(owner);
        this.setState({ owner });
      });
  };

  onCheckStatus = async (event) => {
    event.preventDefault();

    const account = await window.ethereum.selectedAddress;
    this.setState({ account });

    const GelatoRelaySDK = new GelatoRelay();

    const id = this.state.id;

    const status = await GelatoRelaySDK.getTaskStatus(id);
    console.log(status);
  };

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <h1>Gelato Biconomy test</h1>
          <br></br>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <div>
                  <p>Owner : {this.state.account}</p>
                </div>
                <br></br>
                <h4>Mint Gelato</h4>
                <p>For Gelato mints open the console and wait for the task ID after pressing mint.<br></br> Paste the task Id into the Check Task Status form and check until the taskState changes to ExecSuccess.<br></br> Then copy the transaction hash and check on goerli etherscan.</p>
                <form onSubmit={this.onLazyMint}>
                  <input type="submit" />
                </form>
                <br></br>
                <br></br>
                <h4>Add Validator</h4>
                <p>For adding validator open the console and wait for the task ID after pressing submit.<br></br> Paste the task Id into the Check Task Status form and check until the taskState changes to ExecSuccess.<br></br> Then copy the transaction hash and check on goerli etherscan.</p>
                <form onSubmit={this.onAddValidator}>
                  <input placeholder="Collection Address" onChange={this.captureCollection} />
                  <input placeholder="Id" onChange={this.captureId} />
                  <input placeholder="Validator" onChange={this.captureValidator} />
                  <input type="submit" />
                </form>
                <br></br>
                <h4>Check Owner</h4>
                <br></br>
                <form onSubmit={this.onOwnerCall}>
                  <input placeholder="Id" onChange={this.captureId} />
                  <br></br>
                  <input type="submit" />
                </form>
                <br></br>
                <h4>Check Task status</h4>
                <br></br>
                <form onSubmit={this.onCheckStatus}>
                  <input placeholder="Id" onChange={this.captureId} />
                  <br></br>
                  <input type="submit" />
                </form>
                <br></br>
                <br></br>
                <br></br>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;


