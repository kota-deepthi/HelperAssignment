import { Component, Inject, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HelperService } from '../../services/helper.service';
import { MatDivider } from '@angular/material/divider';
import { DeleteDialogComponent } from '../../shared/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu'
import { Form, FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatOption, MatOptionModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import Helper from '../../models/helper.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatIconModule, MatButtonModule, NgIf, NgFor, MatDivider,
    DeleteDialogComponent, MatMenuModule, ReactiveFormsModule, MatFormField, MatSelectModule, MatOption, MatFormFieldModule, MatInputModule, MatOptionModule,
    MatCheckbox, CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  typeofserviceoptions= ['cook', 'nurse', 'driver', 'maid']
  organisationoptions=['ASBL', 'Spring helpers']
  showResult = false

  constructor(private router: Router,
    private helperService: HelperService,
    private dialog: MatDialog,
    private _snackbar: MatSnackBar
  ){}

  get isAddHelperRoute(): boolean{
    return this.router.url.includes('/helper/add-helper')
  }

  Helpers: Helper[] = []
  searchField = new FormControl('')
  filteredHelpers: Helper[] = []
  serviceFilter = new FormControl<string[]>([])
  organisationFilter = new FormControl<string[]>([])
  serviceSearch = new FormControl('')
  orgSearch = new FormControl('')
  filteredServiceOptions: string[] =[]
  filteredOrgOptions: string[] = []
    
  ngOnInit(): void {
    this.fetchHelpers()
    this.searchField.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(()=> this.applyFilterAndSearch());
    this.filteredServiceOptions = [...this.typeofserviceoptions]
    this.filteredOrgOptions = [...this.organisationoptions] 
    this.serviceSearch.valueChanges.subscribe(value=>{
      if(!value){
        this.filteredServiceOptions = [...this.typeofserviceoptions]
      }else{
        this.filteredServiceOptions = this.typeofserviceoptions.filter(service=> service.toLowerCase().includes(value.toLowerCase()))
      }
    })
    this.orgSearch.valueChanges.subscribe(value=>{
      if(!value){
        this.filteredOrgOptions = [...this.organisationoptions]
      }else{
        this.filteredOrgOptions = this.organisationoptions.filter(org=> org.toLowerCase().includes(value.toLowerCase()))
      }
    })
  }

  fetchHelpers(): void{
    this.helperService.getHelper().subscribe({
      next: (helpers)=>{
        this.Helpers = helpers;
        this.filteredHelpers = helpers;
        this.selectedHelper = helpers[0]
        console.log(this.Helpers);
      },
      error: (err) =>{
        console.log("Something went wrong while fetching the data...")
      }
    });
  }

  applyFilterAndSearch(){
    this.showResult = true
    if(!this.serviceFilter && !this.organisationFilter && !this.searchField){
      this.showResult = false
    }
    const filter = {
      service: this.serviceFilter.value ?? [],
      organisation: this.organisationFilter.value?? [],
      search: this.searchField.value?? ''
    }

    this.helperService.searchFilter(filter).subscribe({
      next: (helpers)=>{
        this.filteredHelpers = helpers
        this.selectedHelper = this.filteredHelpers[0]
      }
    })
  }

  onSelectionChange(event: MatSelectChange, filter: string){
    if(filter==='service'){
      this.serviceFilter.patchValue(event.value)
    }else{
      this.organisationFilter.patchValue(event.value)
    }
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
      data: {name: this.selectedHelper?.fullName, service: this.selectedHelper?.serviceType}
    });

    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        if (!this.selectedHelper || !this.selectedHelper._id) return;
        this.helperService.deleteHelper(this.selectedHelper._id).subscribe({
          next:()=>{
            this._snackbar.open("Helper Deleted Successfully!", "Close", {duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'right'})
            this.fetchHelpers()
            this.selectedHelper = null;
          },
          error:(err)=>{
            this._snackbar.open("Helper Deletion Failed!", "Close", {duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'right'})
            console.error("Couldn't delete the helper",err);
          }
        });

      }
    })
  }

  sortHelper(sortby: string){
    if(sortby==='code'){
      this.filteredHelpers.sort((a,b)=>a.employeeCode - b.employeeCode)
    }else if(sortby==='name'){
      this.filteredHelpers.sort((a,b)=> a.fullName.localeCompare(b.fullName))
    }
  }

  editHelper(id: string) {
    this.router.navigate([`/helper/edit-helper/${id}`])
  }

  getInitial(name: string): string{
    const splitchars= name.split('');
    return (splitchars[0] + splitchars[1]).toUpperCase();
  }

  resetFilters(){
    this.showResult = false
    this.serviceFilter.setValue([])
    this.organisationFilter.setValue([])
  }

  resetOne(filter: string){
    if(filter==='service'){
      this.serviceFilter.setValue([])
    }else{
      this.organisationFilter.setValue([])
    }
    if(!this.serviceFilter && !this.organisationFilter){
      this.showResult = false
    }
  }

}
