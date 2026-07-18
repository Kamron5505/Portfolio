import { put, del } from '@vercel/blob';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

// Загрузка файлов работает в двух режимах:
//
//  • BLOB_READ_WRITE_TOKEN задан → Vercel Blob. Единственный вариант для
//    продакшена: файловая система serverless-функции доступна только на чтение,
//    и всё записанное туда исчезает вместе с инстансом.
//  • Токена нет → локальная папка public/uploads. Нужно, чтобы админку можно
//    было гонять на своей машине без облачных сервисов.

type Category = 'image' | 'video' | 'pdf';
export type UploadFolder = 'avatar' | 'covers' | 'cv' | 'highlights';

// Видео тяжелее картинок, поэтому лимит на него отдельный. На проде решает не он,
// а платформа: Server Actions на Vercel принимают ~4.5 МБ на запрос, так что
// крупные ролики надёжнее давать внешней ссылкой (см. поле «ссылка» в хайлайтах).
const MAX_BYTES: Record<Category, number> = {
  image: 8 * 1024 * 1024,
  video: 48 * 1024 * 1024,
  pdf: 8 * 1024 * 1024,
};

const ALLOWED = new Map<string, { ext: string; category: Category }>([
  ['image/jpeg', { ext: 'jpg', category: 'image' }],
  ['image/png', { ext: 'png', category: 'image' }],
  ['image/webp', { ext: 'webp', category: 'image' }],
  ['image/avif', { ext: 'avif', category: 'image' }],
  ['image/svg+xml', { ext: 'svg', category: 'image' }],
  ['application/pdf', { ext: 'pdf', category: 'pdf' }],
  ['video/mp4', { ext: 'mp4', category: 'video' }],
  ['video/webm', { ext: 'webm', category: 'video' }],
  ['video/quicktime', { ext: 'mov', category: 'video' }],
]);

// Что можно грузить в каждую папку.
const FOLDER_CATEGORIES: Record<UploadFolder, Category[]> = {
  avatar: ['image'],
  covers: ['image'],
  cv: ['pdf'],
  highlights: ['image', 'video'],
};

export const isBlobStorageEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export class UploadError extends Error {}

/** Сохраняет файл и возвращает публичный URL (абсолютный для Blob, /uploads/... локально). */
export async function saveUpload(file: File, folder: UploadFolder): Promise<string> {
  if (!file || file.size === 0) throw new UploadError('Файл не выбран.');

  const type = ALLOWED.get(file.type);
  if (!type) {
    throw new UploadError(`Неподдерживаемый тип файла: ${file.type || 'неизвестен'}.`);
  }
  if (!FOLDER_CATEGORIES[folder].includes(type.category)) {
    throw new UploadError('Сюда такой файл загрузить нельзя.');
  }
  if (file.size > MAX_BYTES[type.category]) {
    throw new UploadError(`Файл больше ${Math.round(MAX_BYTES[type.category] / 1024 / 1024)} МБ.`);
  }

  // Имя генерируется на сервере: пользовательское имя файла в путь не попадает,
  // поэтому обойти каталог через «../» невозможно.
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}.${type.ext}`;
  const key = `${folder}/${filename}`;

  if (isBlobStorageEnabled()) {
    const blob = await put(key, file, { access: 'public', contentType: file.type });
    return blob.url;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${filename}`;
}

/** Определяет тип медиа по расширению ссылки — для внешних URL, где нет MIME. */
export function guessMediaKind(url: string): 'image' | 'video' {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url) ? 'video' : 'image';
}

/** Удаляет ранее загруженный файл. Ошибки не критичны: осиротевший файл лучше упавшего сохранения. */
export async function deleteUpload(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith('http')) {
      if (isBlobStorageEnabled()) await del(url);
      return;
    }
    if (url.startsWith('/uploads/')) {
      await unlink(path.join(process.cwd(), 'public', url));
    }
  } catch (error) {
    console.error('[storage] не удалось удалить файл:', url, error);
  }
}
