import { Component, OnDestroy, OnInit } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  concatMap,
  finalize,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Category } from '@challenge/api-interfaces';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CategoryService } from '../../../services/category.service';
import { CategoryModalFormComponent } from '../components/category-modal-form/category-modal-form.component';

@Component({
  selector: 'challenge-categories',
  templateUrl: './dashboard-categories.component.html',
  styleUrls: ['./dashboard-categories.component.scss'],
})
export class DashboardCategoriesComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  dataFetcher$ = new Subject<void>();
  dataDeletion$ = new Subject<number>();

  isDataLoading = false;
  listOfData: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.dataFetcher$
      .pipe(
        takeUntil(this.destroy$),
        startWith(null),
        tap(() => (this.isDataLoading = true)),
        switchMap(() =>
          this.categoryService.list().pipe(
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
          this.categoryService.delete(id).pipe(
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
      nzTitle: 'Добавление категории',
      nzContent: CategoryModalFormComponent,
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
        nzTitle: 'Редактирование категории',
        nzComponentParams: { data },
        nzContent: CategoryModalFormComponent,
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
