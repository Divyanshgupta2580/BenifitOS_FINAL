import { CitizenEntity } from './citizen.entity';
export interface ICitizenRepository {
    findById(id: string): Promise<CitizenEntity | null>;
    findByUserId(userId: string): Promise<CitizenEntity | null>;
    findByAadhaarHash(aadhaarHash: string): Promise<CitizenEntity | null>;
    save(citizen: CitizenEntity): Promise<CitizenEntity>;
    update(citizen: CitizenEntity): Promise<CitizenEntity>;
    delete(id: string): Promise<void>;
}
