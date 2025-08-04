import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';

interface DialogData{
  name: string
}

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [MatDivider, MatDialogActions, MatDialogContent],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss'
})
export class DeleteDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>)
  readonly data = inject<DialogData>(MAT_DIALOG_DATA)

  onClose():void {
    this.dialogRef.close(false)
  }

  onDelete() : void{
    this.dialogRef.close(true)
  }

}
