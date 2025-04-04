// import { Injectable } from '@angular/core';
// import { BrowserProvider, Contract, parseUnits } from 'ethers';

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class BlockchainService {
//   provider: BrowserProvider | undefined;
//   signer: any;
//   usdcContract: Contract | undefined;
//   saleContract: Contract | undefined;
//   walletAddress: string = '';

//   contractAddress: string = '0x4b807205Eb786ecc3AF87D31761d774E92b89331';
//   usdcAddress: string = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

//   contractABI: any = [
//     {
//       "inputs": [
//         { "internalType": "uint256", "name": "amount", "type": "uint256" }
//       ],
//       "name": "makePayment",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     }
//   ];

//   usdcAbi: any = [
//     "function approve(address spender, uint256 amount) external returns (bool)"
//   ];

//   constructor() { }

//   async connectWallet(): Promise<string> {
//     if (window.ethereum) {
//       this.provider = new BrowserProvider(window.ethereum);
//       await this.provider.send('eth_requestAccounts', []);
//       const accounts = await this.provider.listAccounts();
//       this.signer = await this.provider.getSigner();
//       if (accounts.length > 0) {
//         // ethers v6: Lấy địa chỉ từ accounts[0].address
//         this.walletAddress = accounts[0].address;
//       }
//       // Khởi tạo contract
//       this.usdcContract = new Contract(this.usdcAddress, this.usdcAbi, this.signer);
//       this.saleContract = new Contract(this.contractAddress, this.contractABI, this.signer);
//       return this.walletAddress;
//     } else {
//       throw new Error('MetaMask is not installed.');
//     }
//   }

//   async makePayment(amountStr: string): Promise<void> {
//     if (!this.signer || !this.usdcContract || !this.saleContract) {
//       throw new Error('Wallet is not connected.');
//     }
//     if (!amountStr || parseFloat(amountStr) <= 0) {
//       throw new Error('Enter a valid USDC amount!');
//     }

//     // Chuyển amountStr thành chuỗi (nếu chưa)
//     const amount = parseUnits(String(amountStr), 6);

//     // Gọi approve
//     const tx1 = await this.usdcContract['approve'](this.contractAddress, amount);
//     await tx1.wait();

//     // Gọi hàm makePayment trên contract
//     const tx2 = await this.saleContract['makePayment'](amount);
//     await tx2.wait();
//   }
// }
