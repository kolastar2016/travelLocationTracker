import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-place-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './place-card.component.html',
  styleUrl: './place-card.component.scss',
})
export class PlaceCardComponent {
  @Input({ required: true }) place!: Place;
  @Input() saved = false;

  /** Чи увімкнені платні Premium-функції (рейтинг, фото). */
  readonly premiumEnabled = environment.premiumFeaturesEnabled;

  @Output() toggleSave = new EventEmitter<Place>();
  @Output() openDetails = new EventEmitter<Place>();

  readonly photoIndex = signal(0);
  private readonly imgFailed = signal(false);

  get cover(): string | null {
    if (this.imgFailed() || this.place.photos.length === 0) {
      return null;
    }
    return this.place.photos[this.photoIndex() % this.place.photos.length];
  }

  get stars(): number {
    return this.place.rating ? Math.round((this.place.rating / 10) * 5) : 0;
  }

  get ratingClass(): string {
    const r = this.place.rating ?? 0;
    if (r >= 9) return 'rating--high';
    if (r >= 7) return 'rating--mid';
    return 'rating--low';
  }

  onImgError(): void {
    this.imgFailed.set(true);
  }

  nextPhoto(event: Event): void {
    event.stopPropagation();
    if (this.place.photos.length > 1) {
      this.photoIndex.update((i) => (i + 1) % this.place.photos.length);
    }
  }

  formatDistance(): string | null {
    const d = this.place.distance;
    if (d == null) return null;
    return d >= 1000 ? `${(d / 1000).toFixed(1)} км` : `${d} м`;
  }
}
