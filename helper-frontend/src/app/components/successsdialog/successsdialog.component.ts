import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

interface DialogData{
  name: string
}

@Component({
  selector: 'app-successsdialog',
  standalone: true,
  imports: [MatDialogContent],
  templateUrl: './successsdialog.component.html',
  styleUrl: './successsdialog.component.scss'
})
export class SuccesssdialogComponent {
  readonly dialogRef = inject(MatDialogRef<SuccesssdialogComponent>)
  readonly data = inject<DialogData>(MAT_DIALOG_DATA)
}

