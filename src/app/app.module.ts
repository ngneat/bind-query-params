import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BindQueryParamsModule } from '@ngneat/bind-query-params';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ReactiveFormsModule, AppRoutingModule, BindQueryParamsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
