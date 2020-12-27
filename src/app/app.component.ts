import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BindQueryParamsManager } from '@ngneat/bind-query-params';

interface Params {
  searchTerm: string;
  showErrors: boolean;
  issues: string;
  nested: string;
}

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
    issues: new FormControl([]),
    nested: new FormGroup({
      a: new FormControl(),
    }),
  });

  bindQueryParams = new BindQueryParamsManager<Params>([
    { queryKey: 'searchTerm', trigger: 'submit' },
    { queryKey: 'showErrors', type: 'boolean' },
    { queryKey: 'issues', strategy: 'modelToUrl', type: 'array' },
    { queryKey: 'nested', path: 'nested.a', trigger: 'submit' },
  ]);
}
