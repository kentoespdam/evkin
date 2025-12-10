import { Role } from "./role";

export interface UserWithRole {
  id: string; // sqid encoded ID (e.g., "usr_A3EyoEb2TO")
  name: string;
  email: string;
  avatar?: string;
  role: Role;
}
