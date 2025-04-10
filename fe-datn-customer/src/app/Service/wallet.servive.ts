import { Injectable } from '@angular/core';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { BrowserProvider, Contract, parseUnits } from 'ethers';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private toast: ToastrService) {
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

  async makePayment(amountStr: string): Promise<string> {
    try {
      // Initial connection check toast
      const connectingToast = this.toast.info("Đang kết nối ví...", "", {
        timeOut: 0,
        tapToDismiss: false,
        closeButton: false
      });

      if (!this.signer || !this.usdcContract || !this.saleContract) {
        this.toast.clear(connectingToast.toastId);
        throw new Error('Wallet is not connected.');
      }

      if (!amountStr || parseFloat(amountStr) <= 0) {
        this.toast.clear(connectingToast.toastId);
        throw new Error('Enter a valid USDC amount!');
      }

      const amount = parseUnits(String(amountStr), 6);
      
      // Clear connecting toast and show approval toast
      this.toast.clear(connectingToast.toastId);
      const approvalToast = this.toast.info("Đang chờ phê duyệt USDC...", "", {
        timeOut: 0,
        tapToDismiss: false,
        closeButton: false
      });

      console.log(`Approving ${amount.toString()} USDC for spending...`);
      const tx1 = await this.usdcContract['approve'](this.contractAddress, amount);
      
      // Update toast for waiting confirmation
      this.toast.clear(approvalToast.toastId);
      const confirmationToast = this.toast.info("Đang chờ xác nhận phê duyệt...", "", {
        timeOut: 0,
        tapToDismiss: false,
        closeButton: false
      });

      await tx1.wait();
      this.toast.clear(confirmationToast.toastId);
      this.toast.success("Phê duyệt USDC thành công!");

      // Payment processing toast
      const paymentToast = this.toast.info("Đang xử lý thanh toán...", "", {
        timeOut: 0,
        tapToDismiss: false,
        closeButton: false
      });

      console.log(`Calling makePayment with ${amount.toString()}...`);
      const tx2 = await this.saleContract['makePayment'](amount);
      
      // Update toast for payment confirmation
      this.toast.clear(paymentToast.toastId);
      const paymentConfirmToast = this.toast.info("Đang chờ xác nhận thanh toán...", "", {
        timeOut: 0,
        tapToDismiss: false,
        closeButton: false
      });

      await tx2.wait();
      this.toast.clear(paymentConfirmToast.toastId);
      this.toast.success("Thanh toán thành công!");
      
      console.log('Payment transaction confirmed.');
      return tx2.hash;

    } catch (error: any) {
      // Error handling with appropriate toast
      this.toast.clear(); // Clear any existing toasts
      this.toast.error(error.message || 'Có lỗi xảy ra trong quá trình thanh toán');
      throw error;
    }
  }
}