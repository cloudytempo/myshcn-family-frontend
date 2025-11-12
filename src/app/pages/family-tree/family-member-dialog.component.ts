import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { FamilyMember, Person } from '../../models/family.model';
import { FamilyService } from '../../services/family.service';

export interface FamilyMemberDialogData {
  mode: 'add' | 'edit';
  parentId?: number;
  generation?: number;
  member?: FamilyMember;
}

@Component({
  selector: 'app-family-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './family-member-dialog.component.html',
  styleUrls: ['./family-member-dialog.component.css']
})
export class FamilyMemberDialogComponent {
  form!: FormGroup;
  existingMembers: FamilyMember[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FamilyMemberDialogComponent>,
    private familyService: FamilyService,
    @Inject(MAT_DIALOG_DATA) public data: FamilyMemberDialogData
  ) {
    // Initialize form with new schema fields
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      gender: ['UNKNOWN'],
      date_of_birth: [''],
      date_of_death: [''],
      notes: [''],
      photo_url: ['']
    });

    const tree = this.familyService.currentFamilyTree;
    this.existingMembers = tree?.members || [];

    if (data?.member) {
      this.form.patchValue({
        first_name: data.member.firstName || '',
        last_name: data.member.lastName || '',
        gender: data.member.gender || 'UNKNOWN',
        date_of_birth: data.member.dateOfBirth || '',
        date_of_death: data.member.dateOfDeath || '',
        notes: data.member.notes || '',
        photo_url: data.member.photoUrl || ''
      });
    }
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const payload: Omit<Person, 'id' | 'created_at'> = {
      firstName: String(raw.first_name),
      lastName: String(raw.last_name),
      gender: raw.gender || 'UNKNOWN',
      dateOfBirth: raw.date_of_birth || undefined,
      dateOfDeath: raw.date_of_death || undefined,
      notes: raw.notes || undefined,
      photoUrl: raw.photo_url || undefined
    };

    if (this.data.mode === 'edit' && this.data.member) {
      this.familyService.updatePerson(this.data.member.id, payload).subscribe(updated => {
        this.dialogRef.close({ action: 'updated', member: updated });
      });
    } else {
      this.familyService.createPerson(payload).subscribe(created => {
        this.dialogRef.close({ action: 'created', member: created });
      });
    }
  }

  cancel() {
    this.dialogRef.close({ action: 'cancel' });
  }
}
