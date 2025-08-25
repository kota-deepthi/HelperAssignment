import { Component, OnInit, ViewChild, inject, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { CountryCodeService } from '../../services/country-code.service';
import { HelperService } from '../../services/helper.service';
import { DocdialogComponent } from '../../shared/docdialog/docdialog.component';
import { SuccesssdialogComponent } from '../successsdialog/successsdialog.component';
import { QrdialogComponent } from '../qrdialog/qrdialog.component';
import Helper from '../../models/helper.model';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, NgIf,NgFor, MatSelectModule, MatCheckboxModule,
    MatDividerModule, MatRadioModule, CommonModule, RouterLink, MatFormFieldModule
  ],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.scss'
})
export class HelperFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private helperService = inject(HelperService);
  private countryCodeService = inject(CountryCodeService);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  @ViewChild('stepper') stepper!: MatStepper
  isEditMode: boolean = false;
  helperId: string | null = null;
  recievedHelper: Helper | null = null;
  selectedIndex: number = 0;
  showVehicleNumber: boolean = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  selectedFile: any = null;
  readonly MAX_MB = 5;
  profilepicURL: string | null = null;
  kycPdf: File | null = null;
  kycUrl: string | null = null;
  additionalPdf: File | null = null;
  additionalurl: string | null = null;


  typeofserviceoptions = ['cook', 'nurse', 'driver', 'maid', 'electrician', 'plumber', 'gardener','painter', 'carpender'];
  organisationoptions = ['ASBL', 'Spring helpers'];
  languagesoptions: string[] = ["English", "Telugu", "Hindi", "Kannnada", "Tamil", "Marati"];
  vehicleTypes = ['none', "auto", "bike", "car"];
  countryCode: { name: string; dial_code: string; code: string }[] = [];
  
  serviceSearch = new FormControl('');
  filteredService: string[] = [];

  constructor(private route: ActivatedRoute, 
    private router: Router
  ) {
    this.firstFormGroup = this.formBuilder.group({
      // profilepic: [null, [this.fileTypeValidator(['image/jpeg', 'image/png']), this.fileSizeValidator(5)]],
      profilepic: [null],
      typeOfService: ['', Validators.required],
      organisationName: ['', Validators.required],
      fullName: ['', Validators.required],
      languages: this.formBuilder.nonNullable.control<string[]>([], { validators: Validators.required }),
      gender: ['', Validators.required],
      contryCode: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.email]],
      vehicleType: ['none'],
      vehicleNumber: [''],
      docType: ['', Validators.required],
      KYCDoc: ['', Validators.required],
    });

    this.secondFormGroup = this.formBuilder.group({
      additionalDocType: [''],
      additionalDocs: [null],
    });

    this.firstFormGroup.get('vehicleType')?.valueChanges.subscribe(value => {
        this.showVehicleNumber = value !== 'none';
        if (this.showVehicleNumber) {
            this.firstFormGroup.get('vehicleNumber')?.setValidators(Validators.required);
        } else {
            this.firstFormGroup.get('vehicleNumber')?.clearValidators();
        }
        this.firstFormGroup.get('vehicleNumber')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.countryCode = this.countryCodeService.getCountryCode();

    this.route.paramMap.subscribe(params => {
      this.helperId = params.get('id');
      this.isEditMode = !!this.helperId;
      
      if (this.isEditMode && this.helperId) {
        this.helperService.getHelperByID(this.helperId).subscribe((helper: Helper) => {
          console.log(helper)
          this.recievedHelper = helper;
          this.firstFormGroup.patchValue({
            ...helper,
            typeOfService: helper.serviceType,
            languages: helper.language,
            contryCode: helper.countryCode,
            vehicleType: helper.vehicleType,
          });
          this.secondFormGroup.patchValue({
            additionalDocs: helper.additionalDoc,
          });
          this.profilepicURL = `http://localhost:3000/uploads/${helper.profilePicUrl}`;
          this.kycUrl = `http://localhost:3000/uploads/${helper.kycDocUrl}`;
          this.loadFile(this.kycUrl, "kyc")
          if(helper.additionalDoc){
            this.loadFile("http://localhost:3000/uploads/"+helper.additionalDoc, "additional")
          }
          if(helper.profilePicUrl){
            this.helperService.getPdf(this.profilepicURL).subscribe((File)=>{
              this.firstFormGroup.patchValue({profilepic: File})
            })
          }
        });
      }
    });
    console.log('KYCDoc control:', this.firstFormGroup.get('KYCDoc')?.value);
    console.log('AdditionalDocs control:', this.secondFormGroup.get('additionalDocs')?.value);
    console.log('First form valid?', this.firstFormGroup.valid);
    console.log('Second form valid?', this.secondFormGroup.valid);
    console.log(this.firstFormGroup.get('docType'))
    this.filteredService = [...this.typeofserviceoptions]
    this.serviceSearch.valueChanges.subscribe(value=>{
      this.filterService(value);
    })
    if (this.isEditMode) {
      this.firstFormGroup.patchValue({
        KYCDoc: 'existing-file'
      });
      this.secondFormGroup.patchValue({
        additionalDocs: 'existing-file'
      });
      this.firstFormGroup.patchValue({
        profilepic: ''
      })
    }

  }

  loadFile(url: string, pdf:string){
      this.helperService.getPdf(url).subscribe((File)=>{
        if(pdf==='kyc'){
          this.kycPdf = File
          this.firstFormGroup.patchValue({KYCDoc: this.kycPdf})
        }
        else if(pdf==='additional'){
          this.additionalPdf = File
          this.secondFormGroup.patchValue({})
        }
        console.log(pdf)
      })
    
    }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    if(!this.selectedFile) return;

    const mimeOk = this.selectedFile.type === 'image/jpeg' || this.selectedFile.type === 'image/png';
    const ext = this.selectedFile.name.toLowerCase().split('.').pop() || '';
    const extOk = ext === 'jpg' || ext === 'jpeg' || ext === 'png';

    if (!(mimeOk || extOk)) {
      this.firstFormGroup.get('profilepic')?.setErrors({ type: true });
      return;
    }

    if (this.selectedFile.size > this.MAX_MB * 1024 * 1024) {
      this.firstFormGroup.get('profilepic')?.setErrors({ size: true });
      return;
    }
    this.firstFormGroup.get('profilepic')?.setValue(this.selectedFile);
    this.firstFormGroup.get('profilepic')?.markAsDirty();
    this.profilepicURL = URL.createObjectURL(this.selectedFile)
    
  }

  openDocUpload(docType: 'KYC' | 'additional'): void {
    const dialogRef = this.dialog.open(DocdialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const file = result.file;
        if (docType === 'KYC') {
          this.kycPdf = file;
          this.firstFormGroup.get('KYCDoc')?.setValue(file);
          this.firstFormGroup.get('docType')?.setValue(result.docType);
          this.kycUrl = URL.createObjectURL(file);
        } else {
          this.additionalPdf = file;
          this.secondFormGroup.get('additionalDocs')?.setValue(file);
          this.secondFormGroup.get('additionalDocType')?.setValue(result.docType)
          this.additionalurl = URL.createObjectURL(file);
        }
      }
    });
  }
  
  // validateFile(file: File, type: 'image' | 'pdf'): boolean {
  //   const maxFileSize = 5 * 1024 * 1024; 
  //   if (file.size > maxFileSize) {
  //     this.firstFormGroup.get('profilepic')?.setErrors({ size: true });
  //     return false;
  //   }
  //   if (type === 'image' && !['image/jpeg', 'image/png'].includes(file.type)) {
  //     this.firstFormGroup.get('profilepic')?.setErrors({ type: true });
  //     return false;
  //   }
  //   return true;
  // }

  // fileTypeValidator(allowedTypes: string[]) {
  //   return (control: FormControl) => {
  //     if (!control.value) {
  //       return null;
  //     }
  //     const file = control.value;
  //     return allowedTypes.includes(file.type) ? null : { type: true };
  //   };
  // }

  // fileSizeValidator(maxSizeInMB: number) {
  //   return (control: FormControl) => {
  //     if (!control.value) {
  //       return null;
  //     }
  //     const file = control.value;
  //     return file.size / (1024 * 1024) <= maxSizeInMB ? null : { size: true };
  //   };
  // }

   getPDFName(name: string){
    const splited = name.split('-').slice(1)
    const filename =  splited.join("-")
    if(filename.length > 7){
      return filename.substring(0,7)+"..."
    }else{
      return filename
    }
  }

  isMarkedAsTouched(): boolean {
    return this.firstFormGroup.get('KYCDoc')?.invalid && this.firstFormGroup.get('KYCDoc')?.touched || false;
  }

  goBackToHome(): void {
    this.router.navigate(['/']);
  }

  goNext(stepper: MatStepper): void {
    if (this.firstFormGroup.invalid) {
      this._snackBar.open("Please fill all required fields", 'ok', { duration: 3000 });
      this.firstFormGroup.markAllAsTouched();
      return;
    }
    stepper.next();
  }

  get Selected(): string[] {
    return this.firstFormGroup.get('languages')?.value;
  }

  isAllSelected(): boolean {
    return this.languagesoptions.length > 0 && this.Selected.length === this.languagesoptions.length;
  }

  isPartialSelected(): boolean {
    return this.Selected.length > 0 && this.Selected.length < this.languagesoptions.length;
  }

  isNoneSelected(): boolean {
    return this.Selected.length === 0;
  }
  
  toggleAll(ev: MatOptionSelectionChange, allOption: MatOption): void {
    if (!ev.isUserInput) return;                          
    allOption.deselect();                  
    const ctrl = this.firstFormGroup.get('languages');
    const selectAll = !this.isAllSelected();
    ctrl?.setValue(selectAll ? [...this.languagesoptions] : []);
    ctrl?.markAsDirty();
    ctrl?.updateValueAndValidity({ emitEvent: true });
  }


  filterService(value: string | null){
    if(!value){
      this.filteredService =  [...this.typeofserviceoptions]
    }else{
      this.filteredService = this.typeofserviceoptions.filter(service=> service.toLowerCase().includes(value.toLowerCase()))
    }
  }
  
  getInitial(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  onSubmit(): void {
    console.log('First group values:', this.firstFormGroup.value);
console.log('First group status:', this.firstFormGroup.status);
Object.keys(this.firstFormGroup.controls).forEach(key => {
  console.log(`Control ${key} → value:`, this.firstFormGroup.get(key)?.value, 'status:', this.firstFormGroup.get(key)?.status);
});

console.log('Second group values:', this.secondFormGroup.value);
console.log('Second group status:', this.secondFormGroup.status);
Object.keys(this.secondFormGroup.controls).forEach(key => {
  console.log(`Control ${key} → value:`, this.secondFormGroup.get(key)?.value, 'status:', this.secondFormGroup.get(key)?.status);
});

    if (this.firstFormGroup.invalid) {
      this._snackBar.open("Please fill all required fields", 'ok', { duration: 3000 });
      this.firstFormGroup.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const first = this.firstFormGroup.value;
    const second = this.secondFormGroup.value;

    formData.append('serviceType', first.typeOfService ?? '');
    formData.append('organisationName', first.organisationName ?? '');
    formData.append('fullName', first.fullName ?? '');
    formData.append('gender', first.gender ?? '');
    formData.append('countryCode', first.contryCode ?? '');
    formData.append('phoneNumber', first.phoneNumber ?? '');
    if (first.email) formData.append('email', first.email);
    formData.append('docType', first.docType ?? '');
    formData.append('additionalDocType', second.additionalDocType?? '');
    formData.append('vehicleType', first.vehicleType);
    if (first.vehicleType && first.vehicleType !== 'none') {
      if (first.vehicleNumber) formData.append('vehicleNumber', first.vehicleNumber);
    }else{
      if(first.vehicleNumber) formData.append('vehicleNumber', "");
    }

    if (Array.isArray(first.languages)) {
      first.languages.forEach((lang: string) => {
        formData.append('language[]', lang);
      });
    }

    // const profilepicValue = this.firstFormGroup.get('profilepic')?.value;
    // if (profilepicValue instanceof File) {
    //   formData.append('profilePicUrl', profilepicValue);
    // }
   
    // const kycDocValue = this.firstFormGroup.get('KYCDoc')?.value;
    // if (kycDocValue instanceof File) {
    //   formData.append('kycDocUrl', kycDocValue);
    // }
    // const additionalDocValue = this.secondFormGroup.get('additionalDocs')?.value;
    // if (additionalDocValue instanceof File) {
    //   formData.append('additionalDoc', additionalDocValue);
    // }

    if (this.firstFormGroup.get('profilepic')?.value instanceof File) {
  formData.append('profilePicUrl', this.firstFormGroup.get('profilepic')?.value);
}

    if (this.firstFormGroup.get('KYCDoc')?.value instanceof File) {
  formData.append('kycDocUrl', this.firstFormGroup.get('KYCDoc')?.value);
}

if (this.secondFormGroup.get('additionalDocs')?.value instanceof File) {
  formData.append('additionalDoc', this.secondFormGroup.get('additionalDocs')?.value);
}


    if (this.isEditMode && this.helperId) {
      this.helperService.editHelper(this.helperId, formData).subscribe({
        next: () => {
          this._snackBar.open("Helper updated successfully!", 'ok', { duration: 3000 , verticalPosition: 'bottom', horizontalPosition: 'right'});
          this.router.navigate(['/']);
        },
        error: (err) => {
          this._snackBar.open("Update failed", 'ok', { duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'right', panelClass: ['error'] });
          console.error("Error:", err);
        }
      });
    } else {
      this.helperService.addHelper(formData).subscribe({
        next: (res) => {
          const successdialog = this.dialog.open(SuccesssdialogComponent, { data: { name: first.fullName } });
          setTimeout(() => successdialog.close(), 2000);
          successdialog.afterClosed().subscribe(() => {
            const idDialog = this.dialog.open(QrdialogComponent, { data: { code: res.employeeCode.toString(), name: res.fullName, organisation: res.organisationName, service: res.serviceType, doj: res.DOJ, phone: res.phoneNumber } });
            idDialog.afterClosed().subscribe(() => {
              this.router.navigate(['/']);
            });
          });
        },
        error: (err) => {
          this._snackBar.open("Submission failed", 'ok', { duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'right', panelClass: ['error'] });
          console.error("Error:", err);
        }
      });
    }
  }
}