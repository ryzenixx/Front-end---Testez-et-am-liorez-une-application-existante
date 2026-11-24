import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';

const agent = {
  firstName: 'Alex',
  lastName: 'Durand',
  login: 'agent.test',
  password: 'test-password',
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let page: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    page = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a confirmation after registration succeeds', () => {
    const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.registerForm.setValue(agent);
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));

    http.expectOne({ method: 'POST', url: '/api/register' })
      .flush(null, { status: 201, statusText: 'Created' });

    expect(alert).toHaveBeenCalledWith('SUCCESS!! :-)');
  });

  it('clears the fields when the user cancels', () => {
    component.registerForm.setValue(agent);
    page.querySelector<HTMLButtonElement>('button[type="reset"]')!.click();
    fixture.detectChanges();

    const values = [...page.querySelectorAll('input')].map(input => input.value);
    expect(values).toEqual(['', '', '', '']);
  });
});
