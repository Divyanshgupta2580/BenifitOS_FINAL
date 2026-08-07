import { DocumentEntity } from './document.entity';
import { DocumentType } from '../welfare/scheme.entity';

export interface IDocumentRepository {
  findById(id: string): Promise<DocumentEntity | null>;
  findByUserId(userId: string): Promise<DocumentEntity[]>;
  findByUserAndType(userId: string, type: DocumentType): Promise<DocumentEntity[]>;
  save(document: DocumentEntity): Promise<DocumentEntity>;
  update(document: DocumentEntity): Promise<DocumentEntity>;
  delete(id: string): Promise<void>;
}
