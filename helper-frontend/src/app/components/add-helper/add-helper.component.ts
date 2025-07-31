import { Component, computed, inject, NgModule, OnInit, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators,FormsModule, FormControl} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';
import { MatSelectModule} from '@angular/material/select'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatOption, MatOptionSelectionChange} from '@angular/material/core'
import {MatDividerModule} from '@angular/material/divider'
import {MatRadioModule} from '@angular/material/radio'
import { CountryCodeService } from '../../country-code.service';
import { MatDialog } from '@angular/material/dialog';
import { DocdialogComponent } from '../docdialog/docdialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar'
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
  ],
  templateUrl: './add-helper.component.html',
  styleUrl: './add-helper.component.scss'
})

// export interface languagesOptions{
//   name: string;
//   completed: boolean;
//   suboptions? : languagesOptions[]
// }

export class AddHelperComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  typeofserviceoptions= ['cook', 'nurse', 'driver', 'maid']
  organisationoptions=['ASBL', 'Spring helpers']
  languagesoptions: string[]= ["English", "Telugu", "Hindi", "Kannnada", "Tamil", "Marati"]
  vehicleType= ['None', "Auto", "Bike", "car"]
  countryCode : {name: string; dial_code: string; code: string}[] = [];

  constructor(private countryCodeService: CountryCodeService, private dialog: MatDialog){}

  ngOnInit(): void {
    this.countryCode = this.countryCodeService.getCountryCode();

    this.firstFormGroup.valueChanges.subscribe(val=>{
      const fullNumber = `${val.contryCode??''}${val.phoneNumber??''}`
      this.firstFormGroup.patchValue({phone: fullNumber}, {emitEvent: false});
    })
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
      }
    })
  }



  // readonly languages = signal<languagesOptions>({
  //   name: "select all",
  //   completed: false,
  //   suboptions:[
  //     {name: 'English', completed: false},
  //     {name: 'Hindi', completed: false},
  //     {name: 'Telugu', completed: false},
  //     {name: 'Kannada', completed: false},
  //     {name: 'Tamil', completed: false},
  //   ]
  // })

  // readonly partiallyCompleted = computed(()=>{
  //   const lang = this.languages();
  //   if(!lang.suboptions){
  //     return false;
  //   }
  //   return lang.suboptions.some(t=>t.completed) && !lang.suboptions.every(t=>t.completed);
  // })

  // update(completed: boolean, index?: number){
  //   this.languages.update(lang=>{
  //     if(index==undefined){
  //       lang.completed = completed;
  //       lang.suboptions?.forEach(t=>(t.completed=completed))
  //     }else{
  //       lang.suboptions![index].completed = completed;
  //       lang.completed = lang.suboptions?.every(t=>t.completed) ?? true;
  //     }
  //     return {...lang}
  //   })
  // }

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
    phone:[''],
    email:['', Validators.email],
    vehicleType: ['None'],
    vehicleNumber:[''],
    docType:['', Validators.required],
    KYCDoc:['', Validators.required],
  });

  secondFormGroup = this.formBuilder.group({
    additionalDocs: [],
  });

  selectedIndex = 0;

  private _snackBar = inject(MatSnackBar)

  onSubmit(){
    this._snackBar.open("Form submitted successfully", 'ok', {duration: 3000, horizontalPosition: 'right', verticalPosition: 'bottom'})
    console.log(this.firstFormGroup.controls.profilepic.value)
    console.log(this.firstFormGroup.controls.typeOfService.value)
    console.log(this.firstFormGroup.controls.organisationName.value)
    console.log(this.firstFormGroup.controls.fullName.value)
    console.log(this.firstFormGroup.controls.languages.value)
    console.log(this.firstFormGroup.controls.gender.value)
    console.log(this.firstFormGroup.controls.phone.value)
    console.log(this.firstFormGroup.controls.email.value)
    console.log(this.firstFormGroup.controls.vehicleType.value)
    console.log(this.firstFormGroup.controls.vehicleNumber.value)
    console.log(this.firstFormGroup.controls.docType.value)
    console.log(this.firstFormGroup.controls.KYCDoc.value)
    console.log(this.secondFormGroup.controls.additionalDocs.value)
  }
}
