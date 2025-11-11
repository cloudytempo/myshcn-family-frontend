import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { FamilyTree, FamilyMember } from '../../models/family.model';

@Component({
  selector: 'app-family-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule
  ],
  templateUrl: './family-tree.component.html',
  styleUrl: './family-tree.component.css'
})
export class FamilyTreeComponent implements OnInit {
  @Input() familyTree!: FamilyTree;

  generationGroups: Map<number, FamilyMember[]> = new Map();

  ngOnInit() {
    this.groupMembersByGeneration();
  }

  private groupMembersByGeneration() {
    if (!this.familyTree || !this.familyTree.members) {
      return;
    }

    // Group members by their generation level
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
    return this.familyTree.members.filter(m => m.parentId === member.id);
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
    if (!member.parentId) return undefined;
    return this.familyTree.members.find(m => m.id === member.parentId);
  }
}
