import { Component } from '@angular/core';
import { WalletOnboardService } from '../../Service/wallet.servive';

@Component({
  selector: 'app-test-connect',
  template: `
    <div class="wallet-container">
      <button (click)="connect()">Kết nối ví</button>
      <div *ngIf="wallets && wallets.length">
        <p>Danh sách ví đã kết nối:</p>
        <ul>
          <li *ngFor="let wallet of wallets">
            {{ wallet.label }} - {{ wallet.accounts[0].address }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .wallet-container {
      max-width: 400px;
      margin: 20px auto;
      padding: 20px;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      background-color: #f9f9f9;
      text-align: center;
    }
    button {
      background-color: #4CAF50;
      color: #fff;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      border-radius: 4px;
    }
    button:hover {
      background-color: #45a049;
    }
  `]
})
export class WalletComponent {
  walletAddress: string | null = null; 

  constructor(private walletOnboardService: WalletOnboardService) {}

  async connect() {
    this.walletAddress = await this.walletOnboardService.connectWallet();
  }
}
