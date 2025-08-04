import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AddHelperComponent } from '../components/add-helper/add-helper.component';
import { NgFor, NgIf } from '@angular/common';
import { HeaderComponent } from '../components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HelperService } from '../services/helper.service';
import { MatDivider } from '@angular/material/divider';
import { DeleteDialogComponent } from '../components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu'

interface Helper {
    _id: string,
    employeeCode: number, 
    employeeIDurl: string, 
    profilePicUrl : string,
    serviceType: string
    organisationName: string
    fullName: string
    language: Array<string>
    gender: string
    countryCode: string
    phoneNumber: string
    phone: string
    email : string
    vehicleType : string
    docType: string
    kycDocUrl: string
    additionalDoc : string
    DOJ : Date
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AddHelperComponent, RouterOutlet, NgIf, HeaderComponent, MatIconModule, MatButtonModule, NgIf, NgFor, MatDivider,
    DeleteDialogComponent, MatMenuModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router,
    private helperService: HelperService,
    private dialog: MatDialog
  ){}

  get isAddHelperRoute(): boolean{
    return this.router.url.includes('/add-helper')
  }

  Helpers: Helper[] = []

  ngOnInit(): void {
    this.helperService.getHelper().subscribe({
      next: (helpers)=>{
        this.Helpers = helpers;
        console.log(this.Helpers);
      },
      error: (err) =>{
        console.log("Something went wrong while fetching the data...")
      }
    });
  }

  selectedHelper: Helper | null = null;

  selectHelper(helper: Helper){
    this.selectedHelper = helper;
  }

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleDateString(); 
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {name: this.selectedHelper?.fullName}
    });

    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        if (!this.selectedHelper || !this.selectedHelper._id) return;
        this.helperService.deleteHelper(this.selectedHelper._id).subscribe({
          next:()=>{
            this.Helpers = this.Helpers.filter(h=>h !== this.selectedHelper);
            this.selectedHelper = null;
          },
          error:(err)=>{
            console.error("Couldn't delete the helper",err);
          }
        });

      }
    })
  }

  sortHelper(sortby: string){
    if(sortby==='code'){
      this.Helpers.sort((a,b)=>a.employeeCode - b.employeeCode)
    }else if(sortby==='name'){
      this.Helpers.sort((a,b)=> a.fullName.localeCompare(b.fullName))
    }
  }

  editHelper(id: string) {
    this.router.navigate([`/edit-helper/${id}`])
  }

}
