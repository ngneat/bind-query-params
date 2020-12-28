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
    { queryKey: 'searchTerm' },
    { queryKey: 'showErrors', type: 'boolean', hasDefaultValue: true },
    { queryKey: 'issues', strategy: 'modelToUrl', type: 'array' },
    { queryKey: 'nested', path: 'nested.a', trigger: 'submit' },
  ]);

  ngOnInit() {
    this.group.valueChanges.subscribe((v) => {
      console.log('group valueChanges', v);
    });
  }

  patch() {
    this.group.patchValue({
      searchTerm: 'patched',
    });
  }
}
