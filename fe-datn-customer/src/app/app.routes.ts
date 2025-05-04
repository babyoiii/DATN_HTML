import { Routes } from '@angular/router';
import { HomeComponent } from './Component/home/home.component';
import { MainComponent } from './Layout/main/main.component';
import { DangkiComponent } from './Component/dangki/dangki.component';
import { MoviesComponent } from './Component/movies/movies.component';
import { MovieTheatresComponent } from './Component/movie-theatres/movie-theatres.component';
import { FoodAndDrinkComponent } from './Component/food-and-drink/food-and-drink.component';
import { ShowtimesComponent } from './Component/showtimes/showtimes.component';
import { GiftCardsComponent } from './Component/gift-cards/gift-cards.component';
import { OffersComponent } from './Component/offers/offers.component';
import { DiscountsComponent } from './Component/discounts/discounts.component';
import { OnDemandComponent } from './Component/on-demand/on-demand.component';
import { SeatsComponent } from './Component/seats/seats.component';
import { TicketSeatsComponent } from './Component/ticket-seats/ticket-seats.component';
import { OrdersComponent } from './Component/orders/orders.component';
import { PurchaseComponent } from './Component/purchase/purchase.component';
import { SignInComponent } from './Component/sign-in/sign-in.component';
import { TimkiemrapComponent } from './Component/timkiemrap/timkiemrap.component';
import { PaymentCallBackComponent } from './Component/payment-call-back/payment-call-back.component';
import { MovieDetailNghiaComponent } from './Component/movie-detail-nghia/movie-detail-nghia.component';
import { MyCinexComponent } from './Component/my-cinex/my-cinex.component';
import { ProfileComponent } from './Component/my-cinex/profile/profile.component';
import { BenefitsComponent } from './Component/my-cinex/benefits/benefits.component';
import { WalletComponent } from './Component/my-cinex/wallet/wallet.component';
import { RewardsComponent } from './Component/my-cinex/rewards/rewards.component';
import { HistoryComponent } from './Component/my-cinex/history/history.component';
import { NeedMoreTimeComponent } from './Component/need-more-time/need-more-time.component';
import { TimeUpComponent } from './Component/time-up/time-up.component';
import { TestDialogComponent } from './Component/test-dialog/test-dialog.component';
import { DetailsTicketComponent } from './Component/my-cinex/details-ticket/details-ticket.component';
import { VipMemberComponent } from './Component/my-cinex/vip-member/vip-member.component';
import { VerifyOptComponent } from './Component/verify-opt/verify-opt.component';
import { TroGiupComponent } from './Component/tro-giup/tro-giup.component';
import { SendMailForgotPasswordComponent } from './Component/send-mail-forgot-password/send-mail-forgot-password.component';
import { ResetPasswordComponent } from './Component/reset-password/reset-password.component';
import { DieukhoanComponent } from './Component/tro-giup/dieukhoan/dieukhoan.component';
import { TheThanhVienComponent } from './Component/tro-giup/the-thanh-vien/the-thanh-vien.component';

export const routes: Routes = [
    {
        path: '', component: MainComponent, children: [
            { path: '', component: HomeComponent },
            { path: 'movies', component: MoviesComponent },
            { path: 'movie-theatres', component: MovieTheatresComponent },
            { path: 'food-and-drink', component: FoodAndDrinkComponent },
            { path: 'gift-cards', component: GiftCardsComponent },
            { path: 'offers', component: OffersComponent },
            { path: 'discounts', component: DiscountsComponent },
            { path: 'on-demand', component: OnDemandComponent },
            { path: 'movies/:id', component: MovieDetailNghiaComponent},
            { path: 'help', component: TroGiupComponent},
            { path: 'dieukhoan-dieukien', component: DieukhoanComponent},
            { path: 'thethanhvien', component: TheThanhVienComponent},
            {
                path: 'my-cinex', component: MyCinexComponent, children: [
                    { path: '', component: BenefitsComponent },
                    { path: 'wallet', component: WalletComponent},
                    { path: 'rewards', component: RewardsComponent},
                    { path: 'history', component: HistoryComponent},
                    { path: 'profile', component: ProfileComponent},
                    { path: 'detailOrder/:id', component: DetailsTicketComponent},
                ]
            },
        ]
    },
    { path: 'showtimes', component: ShowtimesComponent },
    { path: 'showtimes/movie/:id', component: ShowtimesComponent }, // Route cho movieId
    { path: 'showtimes/cinema/:id', component: ShowtimesComponent }, // Route cho cinemaId
    { path: 'dangki', component: DangkiComponent },
    { path: 'timkiemrap', component: TimkiemrapComponent },
    { path: 'signin', component: SignInComponent },

    { path: 'booking/:id', component: SeatsComponent },
    { path: 'chon-ve', component: TicketSeatsComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'thanh-toan', component: PurchaseComponent },
    { path: 'payment-callback', component: PaymentCallBackComponent },
    { path: 'NeedMoreTime', component: NeedMoreTimeComponent },
    { path: 'TimeUpComponent', component: TimeUpComponent },
    { path: 'VerifyOpt', component: VerifyOptComponent },
    { path: 'thanhtoanMembership', component: VipMemberComponent},
    { path: 'sendMailForgotPassword', component: SendMailForgotPasswordComponent},
    { path: 'resetPassword', component: ResetPasswordComponent},
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
