import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { getAuth } from 'firebase/auth';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  userInfo: any = {}; 
  isEditing: boolean = false; 

  constructor(private authService: AuthService, private navCtrl: NavController) { }

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      this.userInfo = await this.authService.getUserInfo(user.uid); 
    }
  }

  // Método para editar la información
  editUserInfo() {
    if (this.isEditing) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        this.authService.updateUserInfo(user.uid, this.userInfo); 
      }
    }
    this.isEditing = !this.isEditing; 
  }
  goBack() {
    this.navCtrl.back(); 
  }
}
  
