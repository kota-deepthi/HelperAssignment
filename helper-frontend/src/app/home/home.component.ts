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
import { Form, FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatOption, MatOptionModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';

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
  imports: [RouterLink, AddHelperComponent, RouterOutlet, HeaderComponent, MatIconModule, MatButtonModule, NgIf, NgFor, MatDivider,
    DeleteDialogComponent, MatMenuModule, ReactiveFormsModule, MatFormField, MatSelectModule, MatOption, MatFormFieldModule, MatInputModule, MatOptionModule,
    MatCheckbox
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  typeofserviceoptions= ['cook', 'nurse', 'driver', 'maid']
  organisationoptions=['ASBL', 'Spring helpers']

  constructor(private router: Router,
    private helperService: HelperService,
    private dialog: MatDialog
  ){}

  get isAddHelperRoute(): boolean{
    return this.router.url.includes('/add-helper')
  }

  Helpers: Helper[] = []
  searchField = new FormControl('')
  filteredHelpers: any
  serviceFilter = new FormControl<string[]>([])
  organisationFilter = new FormControl<string[]>([])
    
  ngOnInit(): void {
    this.helperService.getHelper().subscribe({
      next: (helpers)=>{
        this.Helpers = helpers;
        this.filteredHelpers = helpers;
        console.log(this.Helpers);
      },
      error: (err) =>{
        console.log("Something went wrong while fetching the data...")
      }
    });

    this.setUpSearch()    
  }

  setUpSearch(): void {this.searchField.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((search)=>{
    if(search==''){
      this.filteredHelpers = this.Helpers;
    }else{
      this.searchHelpers(search);
    }
    });
}


  searchHelpers(search: any) {
      this.helperService.searchHelper(search).subscribe({
      next: (helpers) => {
        console.log(helpers)
        this.filteredHelpers = helpers;
      },
      error: (err) => {
        console.log('Search error:', err);
      },
    });
  }

  applyFilters(){
    this.helperService.filterHelper({service: this.serviceFilter.value??[], organisation: this.organisationFilter.value??[]}).subscribe({
      next: (helpers)=> {
        this.filteredHelpers = helpers;
      },
      error: (err)=>{
        console.log("something went worng while filtering", err)
      }
    })
  }

  onSelectionChange(event: MatSelectChange){
    this.serviceFilter.patchValue(event.value)
  }

  isAllSelected(filter: FormControl): boolean{
    if(filter === this.serviceFilter){
      return this.serviceFilter.value?.length === this.typeofserviceoptions.length
    }else{
      return this.organisationFilter.value?.length === this.organisationoptions.length
    }
  }

  isIndeterminate(filter: FormControl){
    if(filter === this.serviceFilter){
      return this.serviceFilter.value && this.serviceFilter.value?.length > 0 && this.serviceFilter.value?.length < this.typeofserviceoptions.length;
    }else{
      return this.organisationFilter.value && this.organisationFilter.value?.length> 0 && this.organisationFilter.value?.length < this.organisationoptions.length;
    }
  }

  toggleAll(filter: FormControl){
    const options = filter===this.serviceFilter ? this.typeofserviceoptions : this.organisationoptions
    if(!this.isAllSelected(filter)){
      filter.patchValue([...options])
      console.log(filter)
    }else{
      filter.patchValue([])
    }
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

  getInitial(name: string): string{
    const splitchars= name.split('');
    return (splitchars[0] + splitchars[1]).toUpperCase();
  }

}
