import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, concatMap, finalize, takeUntil, tap } from 'rxjs/operators';
import { differenceInCalendarDays } from 'date-fns';
import { Category, Product, ProductDto } from '@challenge/api-interfaces';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';


@Component({
  selector: 'challenge-category-modal-form',
  templateUrl: './product-modal-form.component.html',
  styleUrls: ['./product-modal-form.component.scss']
})
export class ProductModalFormComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private formSubmit$ = new Subject<ProductDto>();

  today = new Date();
  isButtonLoading = false;
  formGroup = this.fb.group({
    name: [
      null,
      [Validators.required, Validators.minLength(5), Validators.maxLength(40)]
    ],
    price: [0, [Validators.required, Validators.min(1)]],
    expirationDate: [null, [Validators.required]],
    categoryId: [null, [Validators.required]]
  });
  itemId?: number;
  categoryList$: Observable<Category[]> = this.categoryService.list();

  @Input() set data(value: Product) {
    const { id, ...rest } = value;
    this.itemId = id;

    this.formGroup.patchValue({ ...rest, categoryId: rest.category ? rest.category.id : null });
  }

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService
  ) {
  }

  ngOnInit(): void {
    this.formSubmit$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.isButtonLoading = true;
        }),
        concatMap((payload) =>
          (this.itemId
              ? this.productService.put(this.itemId, payload)
              : this.productService.post(payload)
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
        console.log(control.errors);
        if (control.errors?.required) {
          return 'Поле обязательно';
        }
        if (control.errors?.minlength) {
          return `Минимальная длина поля должна быть ${control.errors?.minlength?.requiredLength} символов`;
        }
        if (control.errors?.maxlength) {
          return `Максимальная длина поля должна быть ${control.errors?.maxlength?.requiredLength} символов`;
        }
        if (control.errors?.min) {
          return `Значение должно быть больше ${control.errors?.min?.min}`;
        }
      }
    }

    return '';
  }

  formatterDollar = (value: number) => `$ ${value}`;
  parserDollar = (value: string) => value.replace('$ ', '');
  disabledDate = (current: Date) =>
    differenceInCalendarDays(current, this.today) < 1;
}
