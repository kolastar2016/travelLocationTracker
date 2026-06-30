import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Place } from '../../interfaces';
import { WishlistService } from '../../services/wishlist.service';
import { PlaceCardComponent } from '../../components/place-card/place-card.component';
import { PlaceDetailComponent } from '../../components/place-detail/place-detail.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, PlaceCardComponent, PlaceDetailComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent {
  readonly wishlist = inject(WishlistService);
  readonly selected = signal<Place | null>(null);

  onToggleSave(place: Place): void {
    this.wishlist.toggle(place);
  }

  openDetails(place: Place): void {
    this.selected.set(place);
  }

  closeDetails(): void {
    this.selected.set(null);
  }

  clearAll(): void {
    if (confirm('Очистити весь список бажань?')) {
      this.wishlist.clear();
    }
  }
}
