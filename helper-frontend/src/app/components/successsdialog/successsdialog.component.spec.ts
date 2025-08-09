import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccesssdialogComponent } from './successsdialog.component';

describe('SuccesssdialogComponent', () => {
  let component: SuccesssdialogComponent;
  let fixture: ComponentFixture<SuccesssdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccesssdialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuccesssdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
