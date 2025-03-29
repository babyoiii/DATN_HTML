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
// import { TestBlockChainComponent } from './Component/test-block-chain/test-block-chain.component';
import { WalletComponent } from './Component/test-connect/test-connect.component';
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
            { path: 'movies/:id', component: MovieDetailNghiaComponent },
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
    // { path: 'Test123', component: TestBlockChainComponent },
    { path: 'TestConnect', component: WalletComponent }
    
];
