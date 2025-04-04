import { Injectable } from '@angular/core';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { BrowserProvider, Contract, parseUnits } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class WalletOnboardService {
  private onboard: any;
  public provider: BrowserProvider | null = null;
  public signer: any = null;
  public usdcContract: Contract | null = null;
  public saleContract: Contract | null = null;
  
  // Địa chỉ hợp đồng
  contractAddress: string = '0x4b807205Eb786ecc3AF87D31761d774E92b89331';
  usdcAddress: string = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

  // ABI của Sale Contract (có hàm makePayment)
  contractABI: any = [
    {
      "inputs": [
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "makePayment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // ABI của USDC Contract (chỉ cần hàm approve)
  usdcAbi: any = [
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];

  constructor() {
    const injected = injectedModule();
    const walletConnect = walletConnectModule({
      projectId: '08a6c7700f2ebe4635f9963c8ccf1dbd'
    });

    this.onboard = Onboard({
      wallets: [injected, walletConnect],
      chains: [
        {
          id: '0x1',
          token: 'ETH',
          label: 'Ethereum Mainnet',
          rpcUrl: 'https://cloudflare-eth.com/'
        },
        {
          id: '0xaa36a7',
          token: 'ETH',
          label: 'Sepolia Testnet',
          rpcUrl: 'https://rpc.sepolia.org/'
        }
      ],
      appMetadata: {
        name: 'Your App Name',
        icon: '<svg>Your SVG Icon</svg>',
        description: 'Your app description'
      }
    });
  }

  async connectWallet(): Promise<string | null> {
    const wallets = await this.onboard.connectWallet();
    console.log('Connected wallets:', wallets);
    if (wallets && wallets.length > 0 && wallets[0].accounts.length > 0) {
      const walletAddress = wallets[0].accounts[0].address;
      console.log('Wallet Address:', walletAddress);

      // Tạo ethers provider và signer từ provider của ví
      this.provider = new BrowserProvider(wallets[0].provider);
      this.signer = await this.provider.getSigner();

      // Khởi tạo contract với signer
      this.usdcContract = new Contract(this.usdcAddress, this.usdcAbi, this.signer);
      this.saleContract = new Contract(this.contractAddress, this.contractABI, this.signer);

      return walletAddress;
    }
    return null;
  }

  async makePayment(amountStr: string): Promise<void> {
    if (!this.signer || !this.usdcContract || !this.saleContract) {
      throw new Error('Wallet is not connected.');
    }
    if (!amountStr || parseFloat(amountStr) <= 0) {
      throw new Error('Enter a valid USDC amount!');
    }

    const amount = parseUnits(String(amountStr), 6);

    console.log(`Approving ${amount.toString()} USDC for spending...`);
    const tx1 = await this.usdcContract['approve'](this.contractAddress, amount);
    await tx1.wait();
    console.log('Approval confirmed.');

    console.log(`Calling makePayment with ${amount.toString()}...`);
    const tx2 = await this.saleContract['makePayment'](amount);
    await tx2.wait();
    console.log('Payment transaction confirmed.');
  }
}
