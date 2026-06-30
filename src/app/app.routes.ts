import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';

export const routes: Routes = [
  { path: '', component: SearchComponent, title: 'Пошук місць · Travel Tracker' },
  { path: 'wishlist', component: WishlistComponent, title: 'Список бажань · Travel Tracker' },
  { path: '**', redirectTo: '' },
];
