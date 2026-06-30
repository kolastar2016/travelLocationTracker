import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './place-detail.component.html',
  styleUrl: './place-detail.component.scss',
})
export class PlaceDetailComponent {
  @Input({ required: true }) place!: Place;
  @Input() saved = false;

  readonly premiumEnabled = environment.premiumFeaturesEnabled;

  @Output() close = new EventEmitter<void>();
  @Output() toggleSave = new EventEmitter<Place>();

  readonly activePhoto = signal(0);
  private readonly failedPhotos = signal<Set<number>>(new Set());

  get visiblePhotos(): string[] {
    return this.place.photos.filter((_, i) => !this.failedPhotos().has(i));
  }

  onImgError(index: number): void {
    this.failedPhotos.update((set) => new Set(set).add(index));
  }

  selectPhoto(index: number): void {
    this.activePhoto.set(index);
  }

  formatDistance(): string | null {
    const d = this.place.distance;
    if (d == null) return null;
    return d >= 1000 ? `${(d / 1000).toFixed(1)} км` : `${d} м`;
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
