import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../services/auth.service';
import { FamilyService } from '../../services/family.service';
import { FamilyTreeComponent } from '../family-tree/family-tree.component';
import { User } from '../../models/user.model';
import { FamilyTree } from '../../models/family.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    FamilyTreeComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  familyTree: FamilyTree | null = null;
  loading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private familyService: FamilyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadFamilyTree();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadFamilyTree() {
    this.loading = true;
    this.familyService
      .getFamilyTree()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: tree => {
          this.familyTree = tree;
          this.familyService.setFamilyTree(tree);
          this.loading = false;
        },
        error: error => {
          this.error = 'Failed to load family tree';
          console.error('Error loading family tree:', error);
          this.snackBar.open('Failed to load family tree', 'Close', {
            duration: 5000
          });
          this.loading = false;
        }
      });
  }

  onLogout() {
    this.authService.logout();
    this.snackBar.open('Logged out successfully', 'Close', { duration: 3000 });
    this.router.navigate(['/login']);
  }

  onRefresh() {
    this.loadFamilyTree();
    this.snackBar.open('Family tree refreshed', 'Close', { duration: 2000 });
  }
}
