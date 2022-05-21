import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { catchError, concatMap, finalize, takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'challenge-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private formSubmit$ = new Subject<{ email: string; password: string }>();

  showError = false;
  isButtonLoading = false;
  formGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      email: ['demo', [Validators.required]],
      password: ['demo', [Validators.required]]
    });

    this.formGroup.valueChanges.pipe(
      takeUntil(this.destroy$)).subscribe(() => {
      if (this.showError) {
        this.showError = false;
      }
    });
    this.formSubmit$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.isButtonLoading = true;
        }),
        concatMap((payload) =>
          this.authService.login(payload).pipe(
            finalize(() => (this.isButtonLoading = false)),
            catchError(() => {
              this.showError = true;
              return EMPTY;
            })
          )
        )
      )
      .subscribe(({ accessToken }) => {
        localStorage.setItem('accessToken', accessToken);
        this.router.navigate(['/']);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  handleSubmitForm(): void {
    for (const i in this.formGroup.controls) {
      this.formGroup.controls[i].markAsDirty();
      this.formGroup.controls[i].updateValueAndValidity();
    }

    if (this.formGroup.valid) {
      this.formSubmit$.next(this.formGroup.value);
    }
  }
}
