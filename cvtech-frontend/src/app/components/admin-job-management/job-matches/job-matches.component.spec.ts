import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminJobMatchesComponent } from './job-matches.component';

describe('JobMatchesComponent', () => {
  let component: AdminJobMatchesComponent;
  let fixture: ComponentFixture<AdminJobMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminJobMatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminJobMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
