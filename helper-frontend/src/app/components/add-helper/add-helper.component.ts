import { Component, computed, inject, NgModule, OnInit, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators,FormsModule, FormControl} from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatSelectModule} from '@angular/material/select'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatOption, MatOptionSelectionChange} from '@angular/material/core'
import {MatDividerModule} from '@angular/material/divider'
import {MatRadioModule} from '@angular/material/radio'
import { CountryCodeService } from '../../services/country-code.service';
import { MatDialog } from '@angular/material/dialog';
import { DocdialogComponent } from '../docdialog/docdialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar'
import { HelperService } from '../../services/helper.service';
import { Router, RouterLink } from '@angular/router';
import { HomeComponent } from '../../home/home.component';
import { SuccesssdialogComponent } from '../successsdialog/successsdialog.component';
@Component({
  selector: 'app-add-helper',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgIf, 
    MatSelectModule,
    NgFor,
    MatCheckboxModule,
    MatDividerModule,
    MatRadioModule,
    DocdialogComponent,
    RouterLink,
    HomeComponent,
    CommonModule,
  ],
  templateUrl: './add-helper.component.html',
  styleUrl: './add-helper.component.scss'
})

export class AddHelperComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  typeofserviceoptions= ['cook', 'nurse', 'driver', 'maid']
  organisationoptions=['ASBL', 'Spring helpers']
  languagesoptions: string[]= ["English", "Telugu", "Hindi", "Kannnada", "Tamil", "Marati"]
  vehicleType= ['None', "Auto", "Bike", "car"]
  countryCode : {name: string; dial_code: string; code: string}[] = [];
  kycPdf: File | null = null;
  additionalPdf: File | null = null;
  profilepicURL: string | null = null;
  kycUrl: string | null = null;
  additionalurl: string | null = null;
  serviceSearch = new FormControl('')
  filteredService: string[] = [];


  constructor(
    private countryCodeService: CountryCodeService, 
    private dialog: MatDialog,
    private helperService: HelperService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.countryCode = this.countryCodeService.getCountryCode();
    this.filteredService = [...this.typeofserviceoptions]
    this.serviceSearch.valueChanges.subscribe(value=>{
      this.filterLanguages(value);
    })
  }

  filterLanguages(value: string | null){
    if(!value){
      this.filteredService = [...this.typeofserviceoptions]
    }else{
      this.filteredService = this.typeofserviceoptions.filter(service=> service.toLowerCase().includes(value.toLowerCase()))
    }
  }
  
  openDocUpload(field: string){
    const dialogRef = this.dialog.open(DocdialogComponent);

    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        console.log(res);
        if(field==="KYC"){
          this.firstFormGroup.patchValue({
            docType: res.docType,
            KYCDoc: res.file
          });
          this.kycPdf = res.file
          this.kycUrl = URL.createObjectURL(res.file);
        }
        else{
          this.secondFormGroup.patchValue({
            additionalDocType: res.docType,
            additionalDocs: res.file
          })
          this.additionalPdf = res.file
          this.additionalurl = URL.createObjectURL(res.file)
        }
      }
    })
  }

  get Selected() : string[] {
    return this.firstFormGroup.controls.languages.value;
  }

  isAllSelected(): boolean {
    return this.languagesoptions.length >0 && this.Selected.length === this.languagesoptions.length;
  }

  isPartialSelected() : boolean {
    return this.Selected.length >0 &&  this.Selected.length < this.languagesoptions.length;
  }

  isNoneSelected(): boolean {
    return this.Selected.length === 0;
  }

  toggleAll(ev: MatOptionSelectionChange, allOption: MatOption): void {
    if (!ev.isUserInput) return;                          
    allOption.deselect();                  
    const ctrl = this.firstFormGroup.controls.languages;
    const selectAll = !this.isAllSelected();
    ctrl.setValue(selectAll ? [...this.languagesoptions] : []);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity({ emitEvent: true });
  }

  get showVehicleNumber() : boolean {
    return this.firstFormGroup.get('vehicleType')?.value !== 'None';
  }

  selectedFile: any= null;
  readonly MAX_MB = 5;
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    if(!this.selectedFile) return;

    const mimeOk = this.selectedFile.type === 'image/jpeg' || this.selectedFile.type === 'image/png';
    const ext = this.selectedFile.name.toLowerCase().split('.').pop() || '';
    const extOk = ext === 'jpg' || ext === 'jpeg' || ext === 'png';

    if (!(mimeOk || extOk)) {
      this.firstFormGroup.controls.profilepic.setErrors({ type: true });
      return;
    }

    if (this.selectedFile.size > this.MAX_MB * 1024 * 1024) {
      this.firstFormGroup.controls.profilepic.setErrors({ size: true });
      return;
    }
    this.firstFormGroup.controls.profilepic.setValue(this.selectedFile);
    this.firstFormGroup.controls.profilepic.markAsDirty();
    this.profilepicURL = URL.createObjectURL(this.selectedFile)
    
  }

  firstFormGroup = this.formBuilder.group({
    profilepic:[''],
    typeOfService:['', Validators.required],
    organisationName:['', Validators.required],
    fullName: ['', Validators.required],
    languages:this.formBuilder.nonNullable.control<string[]>([],{validators: Validators.required}),
    gender:['', Validators.required],
    contryCode: ['+91', Validators.required],
    phoneNumber: ['', Validators.required],
    email:['', Validators.email],
    vehicleType: ['None'],
    vehicleNumber:[''],
    docType:['', Validators.required],
    KYCDoc:['', Validators.required],
  });

  secondFormGroup = this.formBuilder.group({
    additionalDocType: [''],
    additionalDocs: [],
  });

  selectedIndex = 0;

  private _snackBar = inject(MatSnackBar)

  onSubmit() {
  if (this.firstFormGroup.invalid) {
    this._snackBar.open("Please fill all required fields", 'ok', { duration: 3000 });
    return;
  }

  const formData = new FormData();
  const first = this.firstFormGroup.value;
  const second = this.secondFormGroup.value;

  formData.append('serviceType', first.typeOfService ?? '');
  formData.append('organisationName', first.organisationName ?? '');
  formData.append('fullName', first.fullName ?? '');
  formData.append('gender', first.gender?? '');
  formData.append('countryCode', first.contryCode?? '');
  formData.append('phoneNumber', first.phoneNumber ?? '');
  if (first.email) formData.append('email', first.email);
  formData.append('docType', first.docType?? '');

  if (first.vehicleType && first.vehicleType !== 'None') {
    formData.append('vehicleType', first.vehicleType);
    if (first.vehicleNumber) formData.append('vehicleNumber', first.vehicleNumber);
  }

  if (Array.isArray(first.languages)) {
    first.languages.forEach((lang: string) => {
      formData.append('language[]', lang);
    });
  }

  if (first.profilepic && typeof first.profilepic==='object' && 'name' in  first.profilepic) {
    formData.append('profilePicUrl', first.profilepic);
  }

  if (first.KYCDoc &&  typeof first.KYCDoc==='object' && 'name' in first.KYCDoc) {
    formData.append('kycDocUrl', first.KYCDoc);
  }

  if (second.additionalDocs && typeof second.additionalDocs==='object' && 'name' in second.additionalDocs) {
    formData.append('additionalDoc', second.additionalDocs);
  }

  this.helperService.addHelper(formData).subscribe({
    next: (res) => {
      const successdialog = this.dialog.open(SuccesssdialogComponent, {data : {name: first.fullName}});
      console.log("Form submitted successfully")
      setTimeout(()=>{
        successdialog.close()
        this.router.navigate(['/'])
      }, 2000)
    },
    error: (err) => {
      this._snackBar.open("Submission failed", 'ok', { duration: 3000 , verticalPosition:'bottom', horizontalPosition:'right', panelClass:['error']});
      console.error("Error:", err);
    }
  });
}

  goBackToHome(){
    this.router.navigate(['/'])
  }
  getPDFName(name: string){
    const splited = name.split('-').slice(1)
    const filename =  splited.join("-")
    if(filename.length > 10){
      return filename.substring(0,10)+"..."
    }else{
      return filename
    }
  }

  getInitial(name: string | null | undefined): string{
    if(!name) return ''
    const splitchars= name.split('');
    return (splitchars[0] + splitchars[1]).toUpperCase();
  }

  goNext(stepper : MatStepper){
    // if(this.firstFormGroup.valid){
    //   this.selectedIndex = 1
    // }else{
    //   this.firstFormGroup.markAllAsTouched()
    // }
    this.selectedIndex = 1
  }

  isMarkedAsTouched(){
    return this.firstFormGroup.get('KYCDoc')?.touched || !this.firstFormGroup.get('KYCDoc')
  }




}
