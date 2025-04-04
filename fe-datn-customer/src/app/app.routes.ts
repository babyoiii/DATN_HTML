import { Routes } from '@angular/router';
import path from 'path';
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
import { Test1Component } from './Component/test1/test1.component';
import { MyCinexComponent } from './Component/my-cinex/my-cinex.component';
import { ProfileComponent } from './Component/my-cinex/profile/profile.component';
import { BenefitsComponent } from './Component/my-cinex/benefits/benefits.component';
import { WalletComponent } from './Component/my-cinex/wallet/wallet.component';
import { TicketsComponent } from './Component/my-cinex/tickets/tickets.component';
import { RewardsComponent } from './Component/my-cinex/rewards/rewards.component';
import { HistoryComponent } from './Component/my-cinex/history/history.component';
import { NeedMoreTimeComponent } from './Component/need-more-time/need-more-time.component';
import { TimeUpComponent } from './Component/time-up/time-up.component';
import { TestDialogComponent } from './Component/test-dialog/test-dialog.component';

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
            {
                path: 'my-cinex', component: MyCinexComponent, children: [
                    { path: '', component: BenefitsComponent },
                    { path: 'wallet', component: WalletComponent},
                    { path: 'tickets', component: TicketsComponent},
                    { path: 'rewards', component: RewardsComponent},
                    { path: 'history', component: HistoryComponent},
                    { path: 'profile', component: ProfileComponent},
                ]
            },
        ]
    },
    { path: 'a', component: ShowtimesComponent },
    { path: 'showtimes', component: ShowtimesComponent },
    { path: 'showtimes/:id', component: ShowtimesComponent },
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
    { path: 'test', component: TestDialogComponent },

    // { path: 'Test123', component: TestBlockChainComponent },
];
