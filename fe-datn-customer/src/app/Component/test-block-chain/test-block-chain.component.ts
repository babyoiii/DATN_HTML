import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Web3 from 'web3';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any; // Use a more specific type if you have MetaMask's type definitions
  }
}

@Component({
  selector: 'app-test-block-chain',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './test-block-chain.component.html',
  styleUrls: ['./test-block-chain.component.css']
})
export class TestBlockChainComponent {
  walletAddress: string | null = null;
  web3: Web3 | null = null;
  paymentAmount: number = 0; 
  // Contract addresses
  private readonly usdcContractAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Replace with your USDC contract address
  private readonly cinemaPaymentContractAddress = '0xA24b1e5502b5f956033d43764f18173440a5a5f2'; // Replace with your CinemaPayment contract address

  // ABI for USDC contract
  private readonly usdcABI = [
    {
      constant: false,
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ];

  // ABI for CinemaPayment contract
  private readonly cinemaPaymentABI = [
    {
      constant: false,
      inputs: [{ name: 'amount', type: 'uint256' }],
      name: 'makePayment',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ];

  constructor() {
    // Initialize Web3 if Ethereum is available
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else {
      console.error('Ethereum provider not found. Please install MetaMask or another wallet.');
    }
  }

  async connectWallet() {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum-compatible wallet.');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.walletAddress = accounts[0];
      console.log('Connected wallet address:', this.walletAddress);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet.');
    }
  }

  async disconnectWallet() {
    // Disconnecting a wallet is not natively supported by MetaMask
    this.walletAddress = null;
    console.log('Disconnected wallet');
  }

  async approveAndPay() {
    if (!this.walletAddress || !this.web3) {
      console.error('Please connect your wallet first.');
      return;
    }

    if (this.paymentAmount <= 0) {
      console.error('Amount must be greater than zero.');
      alert('Amount must be greater than zero.');
      return;
    }

    const usdcContract = new this.web3.eth.Contract(this.usdcABI, this.usdcContractAddress);
    const cinemaPaymentContract = new this.web3.eth.Contract(this.cinemaPaymentABI, this.cinemaPaymentContractAddress);

    try {
      // Approve the CinemaPayment contract to spend USDC
      console.log(`Approving ${this.paymentAmount} USDC...`);
      await usdcContract.methods['approve'](this.cinemaPaymentContractAddress, this.paymentAmount)
        .send({ from: this.walletAddress });

      console.log(`✅ Successfully approved ${this.paymentAmount} USDC`);

      // Call the makePayment function
      console.log(`Making payment of ${this.paymentAmount} USDC...`);
      await cinemaPaymentContract.methods['makePayment'](this.paymentAmount)
        .send({ from: this.walletAddress });

      console.log(`✅ Successfully paid ${this.paymentAmount} USDC`);
      alert('Payment successful!');
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      alert('Transaction failed!');
    }
  }
}