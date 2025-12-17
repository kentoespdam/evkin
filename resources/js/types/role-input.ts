import { MasterInput } from "./master-input";
import { Role } from "./role";

export interface RoleInput {
    id: string;
    role: Role;
    masterInput: MasterInput;
}