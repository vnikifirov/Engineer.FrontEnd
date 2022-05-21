import { Component } from '@angular/core';
import { User } from '@challenge/api-interfaces';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'challenge-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user$: Observable<Partial<User>> = this.authService.check();

  constructor(
    private modal: NzModalService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  handleShowConfirm(): void {
    this.modal.confirm({
      nzTitle: 'Вы уверены, что хотите выйти?',
      nzOnOk: () => {
        localStorage.removeItem('accessToken');
        this.router.navigate(['/auth']);
      }
    });
  }
}
