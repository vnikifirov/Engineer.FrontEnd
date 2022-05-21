import { Component, OnDestroy, OnInit } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import { Product } from '@challenge/api-interfaces';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  catchError,
  concatMap,
  finalize,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { ProductModalFormComponent } from '../components/product-modal-form/product-modal-form.component';

@Component({
  selector: 'challenge-products',
  templateUrl: './dashboard-products.component.html',
  styleUrls: ['./dashboard-products.component.scss'],
})
export class DashboardProductsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  dataFetcher$ = new Subject<void>();
  dataDeletion$ = new Subject<number>();

  isDataLoading = false;
  listOfData: Product[] = [];

  constructor(
    private productService: ProductService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.dataFetcher$
      .pipe(
        takeUntil(this.destroy$),
        startWith(null),
        tap(() => (this.isDataLoading = true)),
        switchMap(() =>
          this.productService.list().pipe(
            finalize(() => (this.isDataLoading = false)),
            catchError(() => EMPTY)
          )
        )
      )
      .subscribe((data) => {
        this.listOfData = data;
      });
    this.dataDeletion$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => (this.isDataLoading = true)),
        concatMap((id: number) =>
          this.productService.delete(id).pipe(
            catchError(() => {
              this.isDataLoading = false;
              return EMPTY;
            })
          )
        )
      )
      .subscribe(() => {
        this.dataFetcher$.next();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  handleAddItem() {
    const modal = this.modalService.create({
      nzTitle: 'Добавление продукта',
      nzContent: ProductModalFormComponent,
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.dataFetcher$.next();
      }
    });
  }

  handleEditItem(id: number) {
    const data = this.listOfData.find((item) => item.id === id);

    if (data) {
      const modal = this.modalService.create({
        nzTitle: 'Редактирование продукта',
        nzComponentParams: { data },
        nzContent: ProductModalFormComponent,
      });

      modal.afterClose.subscribe((result) => {
        if (result) {
          this.dataFetcher$.next();
        }
      });
    }
  }

  handleShowDeleteConfirm(id: number): void {
    this.modalService.confirm({
      nzTitle: 'Вы уверены, что хотите удалить запись?',
      nzOnOk: () => this.dataDeletion$.next(id),
    });
  }
}
