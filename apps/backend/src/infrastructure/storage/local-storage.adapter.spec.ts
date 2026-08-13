import { LocalStorageAdapter } from './local-storage.adapter';
import * as path from 'path';

describe('LocalStorageAdapter Path Traversal Protection', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
  });

  it('sanitizes relative path traversal filenames', () => {
    const safeName = adapter.sanitizeFilename('../../etc/passwd');
    expect(safeName).not.toContain('..');
    expect(safeName).not.toContain('/');
    expect(safeName).toBe('passwd');
  });

  it('sanitizes absolute path filenames', () => {
    const safeName = adapter.sanitizeFilename('/etc/shadow');
    expect(safeName).not.toContain('/etc');
    expect(safeName).toBe('shadow');
  });

  it('sanitizes unexpected separators and special characters', () => {
    const safeName = adapter.sanitizeFilename('..\\..\\windows\\system32\\cmd.exe');
    expect(safeName).not.toContain('\\');
    expect(safeName).toBe('cmd.exe');
  });

  it('preserves normal filenames cleanly', () => {
    const safeName = adapter.sanitizeFilename('my_aadhaar_card.pdf');
    expect(safeName).toBe('my_aadhaar_card.pdf');
  });

  it('rejects access to paths outside upload directory', async () => {
    const maliciousPath = path.resolve(process.cwd(), '../outside_file.txt');
    await expect(adapter.downloadFile(maliciousPath)).rejects.toThrow('Access denied');
  });
});
