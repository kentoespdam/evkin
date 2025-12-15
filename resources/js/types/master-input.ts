import { MasterSource } from "./master-source";

export interface MasterInput {
    id: string;
    kode: string;
    description: string;
    masterSource: MasterSource;
}