import { RoleDTO } from "src/role/dto/role.dto";

export class UserDTO {
    id: string;
    created_at: Date;
    updated_at: Date;
    username: string;
    name: string;
    email: string;
    roles: RoleDTO;  // Ubah roles menjadi objek RoleDTO
  
    constructor(user: any) {
      this.id = user.id;
      this.created_at = user.created_at;
      this.updated_at = user.updated_at;
      this.username = user.username;
      this.name = user.name;
      this.email = user.email;
      this.roles = user.roles ? new RoleDTO(user.roles) : null;  // Menyertakan role dalam bentuk objek
    }
  }