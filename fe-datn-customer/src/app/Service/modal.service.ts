import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private showSignInModal = new BehaviorSubject<boolean>(false);
  showSignInModal$ = this.showSignInModal.asObservable();

  openSignInModal(): void {
    this.showSignInModal.next(true);
  }

  closeSignInModal(): void {
    this.showSignInModal.next(false);
  }
}