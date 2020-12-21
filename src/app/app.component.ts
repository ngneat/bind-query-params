import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { createQueryParamsDefs } from '@ngneat/bind-query-params';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'bindQueryParams';

  group = new FormGroup({
    searchTerm: new FormControl(),
    showErrors: new FormControl(false),
    v: new FormControl(),
    nested: new FormGroup({
      a: new FormControl(),
    }),
  });

  bindQueryParams = createQueryParamsDefs<any>([
    { queryKey: 'searchTerm', trigger: 'submit' },
    { queryKey: 'showErrors', type: 'boolean' },
    { queryKey: 'v' },
    { queryKey: 'nesteda', path: 'nested.a', trigger: 'submit' },
  ]);
}
