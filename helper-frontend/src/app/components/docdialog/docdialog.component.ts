import { NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-docdialog',
  standalone: true,
  imports: [FormsModule, MatSelectModule, MatFormFieldModule, NgIf, NgFor],
  templateUrl: './docdialog.component.html',
  styleUrl: './docdialog.component.scss'
})
export class DocdialogComponent {

docTypes: string[] = ['Aadhar Card', 'PAN', 'Voter ID', 'Passport'];

  selectedFile: File | null = null;
  docType: string = '';

  constructor(
    public dialogRef: MatDialogRef<DocdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  upload() {
    if (this.selectedFile && this.docType) {
      this.dialogRef.close({ docType: this.docType, file: this.selectedFile });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
