import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Data } from '@angular/router';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';
import html2canvas from 'html2canvas';

interface DialogData{
  name: string
  service: string
  organisation: string
  code: string
  phone: string
  doj: Date
}

@Component({
  selector: 'app-qrdialog',
  standalone: true,
  imports: [CommonModule, QRCodeModule, MatIconModule, MatDivider, MatButtonModule],
  templateUrl: './qrdialog.component.html',
  styleUrl: './qrdialog.component.scss'
})
export class QrdialogComponent {
  @ViewChild('capture') capture!: ElementRef
  readonly dialogRef = inject(MatDialogRef<QrdialogComponent>)
  readonly data = inject<DialogData>(MAT_DIALOG_DATA)

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleDateString(); 
  }

  close(){
    const element = this.capture.nativeElement;
    html2canvas(element).then(canvas=>{
      const imagedata = canvas.toDataURL('image/png');
      this.dialogRef.close(imagedata)
    })
  }

  download(){
    window.print()
  }
}
