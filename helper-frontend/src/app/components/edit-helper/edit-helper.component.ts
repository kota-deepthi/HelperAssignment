import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryCodeService } from '../../services/country-code.service';
import { MatDivider } from '@angular/material/divider';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HelperService } from '../../services/helper.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DocdialogComponent } from '../docdialog/docdialog.component';

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
    email : string
    vehicleType : string
    vehicleNumber?: string
    docType: string
    kycDocUrl: string
    additionalDoc : string
    DOJ : Date
}

@Component({
  selector: 'app-edit-helper',
  standalone: true,
  imports: [
    MatIconModule, NgIf, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatOption, MatSelectModule, MatRadioButton, MatRadioGroup, MatDivider, NgFor,
    MatInputModule, MatButtonModule, CommonModule
  ],
  templateUrl: './edit-helper.component.html',
  styleUrl: './edit-helper.component.scss'
})
export class EditHelperComponent implements OnInit {
  recievedHelper: Helper | null = null;
  selectedIndex = 1;
  typeofserviceoptions = ['cook', 'nurse', 'driver', 'maid'];
  organisationoptions = ['ASBL', 'Spring helpers'];
  languagesoptions: string[] = ['English', 'Telugu', 'Hindi', 'Kannnada', 'Tamil', 'Marati'];
  vehicleType = ['None', 'Auto', 'Bike', 'car'];
  countryCode: { name: string; dial_code: string; code: string }[] = [];

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  DOJ: any;

  private _snackbar = inject(MatSnackBar)

  selectedFile: any = null;
  readonly MAX_MB = 5;
  previewPdf: File | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private countryCodeService: CountryCodeService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private dialog: MatDialog,
    
  ) {}

  ngOnInit(): void {
    this.firstFormGroup = this.formBuilder.group({
      profilepic: [null],
      typeOfService: ['', Validators.required],
      organisationName: ['', Validators.required],
      fullName: ['', Validators.required],
      languages: [[] as string[], Validators.required],
      gender: ['', Validators.required],
      contryCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      vehicleType: ['None'],
      vehicleNumber: [null],
      docType: ['', Validators.required],
      KYCDoc: ['', Validators.required],
    });

    this.secondFormGroup = this.formBuilder.group({
      additionalDocs: [null],
    });

    this.countryCode = this.countryCodeService.getCountryCode();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
        console.error('Helper ID is missing.');
        this.router.navigate(['/']);
        return;
    }
    (this.helperService.getHelperByID(id) as Observable<Helper>).subscribe({
        next: (helper: Helper) => {
            this.recievedHelper = helper;
            console.log(this.recievedHelper.vehicleType)
            console.log(this.recievedHelper.vehicleNumber)
            this.firstFormGroup.patchValue({
                profilepic: this.recievedHelper.profilePicUrl,
                typeOfService: this.recievedHelper.serviceType,
                organisationName: this.recievedHelper.organisationName,
                fullName: this.recievedHelper.fullName,
                languages: this.recievedHelper.language || [],
                gender: this.recievedHelper.gender,
                contryCode: this.recievedHelper.countryCode ?? '+91',
                phoneNumber: this.recievedHelper.phoneNumber,
                email: this.recievedHelper.email,
                vehicleType: this.recievedHelper.vehicleType ?? 'None',
                vehicleNumber: this.recievedHelper.vehicleNumber,
                docType: this.recievedHelper.docType,
                KYCDoc: this.recievedHelper.kycDocUrl,
            });

            this.secondFormGroup.patchValue({
                additionalDocs: this.recievedHelper.additionalDoc,
            });

            this.DOJ = this.recievedHelper.DOJ;
            this.loadPdf("http://localhost:3000/uploads/"+this.recievedHelper.kycDocUrl)
        },
        error: (err) => {
            console.error('Error fetching the helper', err);
        }
    });
  }

  openDocUpload(){
      const dialogRef = this.dialog.open(DocdialogComponent);
  
      dialogRef.afterClosed().subscribe(res=>{
        if(res){
          console.log(res);
          this.firstFormGroup.patchValue({
            docType: res.docType,
            KYCDoc: res.file
          });
          this.previewPdf = res.file
        }
      })
    }

  goBackToHome() {
    this.router.navigate(['/']);
  }

  helperDetails() {
    this.selectedIndex = 1;
  }

  docDetails() {
    this.selectedIndex = 2;
  }

  get showVehicleNumber(): boolean {
    const type = this.firstFormGroup.get('vehicleType')?.value;
    return  type!== 'None' && type!==null && type!=undefined;
}

  get Selected(): string[] {
    return this.firstFormGroup.get('languages')?.value || [];
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
    if (!ctrl) return; 
    const selectAll = !this.isAllSelected();
    ctrl.setValue(selectAll ? [...this.languagesoptions] : []);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity({ emitEvent: true });
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
  }

  loadPdf(url: string){
    this.helperService.getPdf(url).subscribe((File)=>{
      this.previewPdf = File
      console.log(this.previewPdf)
    })
  }

  submit(){
    if (this.firstFormGroup.invalid) {
      this._snackbar.open("Please fill all required fields", 'ok', { duration: 3000, verticalPosition:'bottom', horizontalPosition:'right' });
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

    if (first.vehicleType && first.vehicleType.value !== 'None') {
      formData.append('vehicleType', first.vehicleType);
      if (first.vehicleNumber) formData.append('vehicleNumber', first.vehicleNumber);
    }else if(first.vehicleType.value ==="None"){
      formData.append('vehicleType', 'none');
      formData.append('vehicleNumber', '')
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
    if(!this.recievedHelper?._id) return
    this.helperService.editHelper(this.recievedHelper._id, formData).subscribe({
      next: (res) => {
        this._snackbar.open("Changes saved", 'ok', { duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'right', panelClass:['success'] });
        console.log("Form edited successfully");
        this.router.navigate(['/'])
      },
      error: (err) => {
        this._snackbar.open("Something went wrong", 'ok', { duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'right' , panelClass:['error']});
        console.error("Error:", err);
      }
    });
  }
  getPDFName(name: string){
    const splited = name.split('-').slice(1)
    return splited.join("-")
  }

  isMarkedAsTouched(){
    return this.firstFormGroup.get('KYCDoc')?.touched || !this.firstFormGroup.get('KYCDoc')
  }
}