import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  concatMap,
  finalize,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Category, CategoryDto } from '@challenge/api-interfaces';
import { CategoryService } from '../../../../services/category.service';

@Component({
  selector: 'challenge-category-modal-form',
  templateUrl: './category-modal-form.component.html',
  styleUrls: ['./category-modal-form.component.scss'],
})
export class CategoryModalFormComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private formSubmit$ = new Subject<CategoryDto>();

  isButtonLoading = false;
  formGroup = this.fb.group({
    name: [
      null,
      [Validators.required, Validators.minLength(5), Validators.maxLength(40)],
    ],
  });
  itemId?: number;

  @Input() set data(value: Category) {
    const { id, ...rest } = value;
    this.itemId = id;

    this.formGroup.patchValue({ ...rest });
  }

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.formSubmit$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.isButtonLoading = true;
        }),
        concatMap((payload) =>
          (this.itemId
            ? this.categoryService.put(this.itemId, payload)
            : this.categoryService.post(payload)
          ).pipe(
            finalize(() => (this.isButtonLoading = false)),
            catchError(() => EMPTY)
          )
        )
      )
      .subscribe(() => {
        this.modal.destroy(true);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  handleClose() {
    this.modal.destroy(false);
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

  getFieldError(key: string) {
    if (this.formGroup) {
      const control = this.formGroup.get(key);

      if (control) {
        if (control.errors?.required) {
          return 'Поле обязательно';
        }
        if (control.errors?.minlength) {
          return `Минимальная длина поля должна быть ${control.errors?.minlength?.requiredLength} символов`;
        }
        if (control.errors?.maxlength) {
          return `Максимальная длина поля должна быть ${control.errors?.maxlength?.requiredLength} символов`;
        }
      }
    }

    return '';
  }
}
