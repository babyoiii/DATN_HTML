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
  private showNeedMoreTimeModal = new BehaviorSubject<boolean>(false);
  showNeedMoreTimeModal$ = this.showNeedMoreTimeModal.asObservable();

  openNeedMoreTimeModal(): void {
    this.showNeedMoreTimeModal.next(true);
  }

  closeNeedMoreTimeModal(): void {
    this.showNeedMoreTimeModal.next(false);
  }
  private showTimeUpModal = new BehaviorSubject<boolean>(false);
  showTimeUpModal$ = this.showTimeUpModal.asObservable();

  openTimeUpModal(): void {
    this.showTimeUpModal.next(true);
  }

  closeTimeUpModal(): void {
    this.showTimeUpModal.next(false);
  }
}