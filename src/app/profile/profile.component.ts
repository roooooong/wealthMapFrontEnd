import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  template: `
        <div class="card flex flex-wrap justify-center gap-2">
            <input type="text" pInputText pTooltip="Enter your username" [autoHide]="false" placeholder="autoHide: false" />
            <input type="text" pInputText pTooltip="Enter your username" placeholder="autoHide: true" />
        </div>
    `,
    standalone: true,
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, TooltipModule, FormsModule,InputTextModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

email = "flower543@gmail.com";
changePwd:boolean = false;

toChangePwd(){
this.changePwd = true;
}
cancle(){
  this.changePwd = false;
}

}
