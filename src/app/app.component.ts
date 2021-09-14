import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BindQueryParamsFactory } from '@ngneat/bind-query-params';
import { startWith } from 'rxjs/operators';

interface Params {
  searchTerm: string;
  showErrors: boolean;
  issues: string;
  nested: string;
}

function valueChanges(group: FormGroup) {
  return group.valueChanges.pipe(startWith(group.value));
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'bindQueryParams';

  group = new FormGroup({
    searchTerm: new FormControl('some search term'),
    showErrors: new FormControl(false),
    issues: new FormControl([]),
    nested: new FormGroup(
      {
        a: new FormControl(),
      },
      { updateOn: 'submit' }
    ),
  });

  items: string[] = [];

  private manager = this.factory
    .create<Params>([
      { queryKey: 'searchTerm', syncInitialValue: true },
      { queryKey: 'showErrors', type: 'boolean' },
      { queryKey: 'issues', strategy: 'modelToUrl', type: 'array' },
      { queryKey: 'nested', path: 'nested.a' },
    ])
    .connect(this.group);

  constructor(private factory: BindQueryParamsFactory) {}

  ngOnInit() {
    valueChanges(this.group).subscribe((v) => {
      console.log('initialvalue', v);
    });

    this.group.valueChanges.subscribe((v) => {
      console.log('group valueChanges', v);
    });

    setTimeout(() => {
      this.items = ['1', '2', '3'];
      this.manager.syncDefs('issues');
    }, 1000);
  }

  patch() {
    this.group.patchValue({
      searchTerm: null,
    });
  }

  reset() {
    this.group.reset();
  }
}
