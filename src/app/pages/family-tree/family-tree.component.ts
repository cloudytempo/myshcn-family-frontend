import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FamilyTree, FamilyMember } from '../../models/family.model';
import { FamilyMemberDialogComponent } from './family-member-dialog.component';
import { FamilyService } from '../../services/family.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-family-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
    ,
    MatDialogModule
  ],
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.css']
})
export class FamilyTreeComponent implements OnInit, OnDestroy {
  @Input() familyTree!: FamilyTree;

  generationGroups: Map<number, FamilyMember[]> = new Map();
  // Dialog-driven add/edit — no inline form here

  private destroy$ = new Subject<void>();

  constructor(private familyService: FamilyService, private dialog: MatDialog) {}

  ngOnInit() {
    // If familyTree input is not provided, subscribe to service
    if (!this.familyTree) {
      this.familyService.familyTree$
        .pipe(takeUntil(this.destroy$))
        .subscribe(tree => {
          if (tree) {
            this.familyTree = tree;
            this.groupMembersByGeneration();
          }
        });
    } else {
      this.groupMembersByGeneration();
    }
  }

  private groupMembersByGeneration() {
    if (!this.familyTree || !this.familyTree.members) {
      return;
    }

    // Reset and group members by their generation level
    this.generationGroups = new Map<number, FamilyMember[]>();
    this.familyTree.members.forEach(member => {
      const generation = member.generation || 0;
      if (!this.generationGroups.has(generation)) {
        this.generationGroups.set(generation, []);
      }
      this.generationGroups.get(generation)!.push(member);
    });
  }

  /**
   * Get sorted generations for display
   */
  getSortedGenerations(): number[] {
    return Array.from(this.generationGroups.keys()).sort((a, b) => a - b);
  }

  /**
   * Get members for a specific generation
   */
  getMembersForGeneration(generation: number): FamilyMember[] {
    return this.generationGroups.get(generation) || [];
  }

  /**
   * Get generation label
   */
  getGenerationLabel(generation: number): string {
    const labels: { [key: number]: string } = {
      0: 'Grandparents',
      1: 'Parents',
      2: 'Your Generation',
      3: 'Children',
      4: 'Grandchildren'
    };
    return labels[generation] || `Generation ${generation}`;
  }

  /**
   * Find children of a family member
   */
  getChildren(member: FamilyMember): FamilyMember[] {
    return this.familyTree.members.filter(m => m.parents && m.parents.includes(member.id));
  }

  /**
   * Check if member has children
   */
  hasChildren(member: FamilyMember): boolean {
    return this.getChildren(member).length > 0;
  }

  /**
   * Get member's parent
   */
  getParent(member: FamilyMember): FamilyMember | undefined {
    if (!member.parents || member.parents.length === 0) return undefined;
    return this.familyTree.members.find(m => m.id === member.parents![0]);
  }

  /** UI actions **/
  openAddForm(parentId?: number, generation = 2) {
    const ref = this.dialog.open(FamilyMemberDialogComponent,
      {
        width: '420px',
        data: { mode: 'add', parentId, generation }
      }
    );

    ref.afterClosed().subscribe(result => {
      // the dialog already uses FamilyService to persist; just regroup if changed
      if (result && (result.action === 'created' || result.action === 'updated')) {
        this.familyTree = this.familyService.currentFamilyTree || this.familyTree;
        this.groupMembersByGeneration();
      }
    });
  }

  openEditForm(member: FamilyMember) {
  const ref = this.dialog.open(FamilyMemberDialogComponent, {
      width: '420px',
      data: { mode: 'edit', member }
    });

    ref.afterClosed().subscribe(result => {
      if (result && (result.action === 'updated' || result.action === 'created')) {
        this.familyTree = this.familyService.currentFamilyTree || this.familyTree;
        this.groupMembersByGeneration();
      }
    });
  }

  deleteMember(memberId: number) {
    if (!confirm('Delete this member? This action cannot be undone.')) return;
    this.familyService.deletePerson(memberId).subscribe(() => {
      this.familyTree = this.familyService.currentFamilyTree || this.familyTree;
      this.groupMembersByGeneration();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
