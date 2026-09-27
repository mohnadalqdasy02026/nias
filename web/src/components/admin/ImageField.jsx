import { useRef, useState } from 'react';
import { api } from '../../api/client.js';

const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.85;

/**
 * Client-side downscale + upload to /admin/media, shared by every admin form
 * that accepts an image. Returns a per-key busy flag plus the handlers a field
 * needs.
 */
export function useImageUpload({ onUploaded, onError, altText }) {
  const [busyKey, setBusyKey] = useState(null);
  const inputs = useRef({});

  const compressAndUpload = async (file, targetKey) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError?.('الرجاء اختيار ملف صورة.');
      return;
    }
    setBusyKey(targetKey);
    onError?.(null);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
        reader.readAsDataURL(file);
      });
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('تعذر فتح الصورة'));
        image.src = dataUrl;
      });
      const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const isPng = file.type === 'image/png';
      const outType = isPng ? 'image/webp' : 'image/jpeg';
      const compressed = canvas.toDataURL(outType, IMAGE_QUALITY);
      const base64 = compressed.slice(compressed.indexOf(',') + 1);
      const baseName =
        file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || targetKey;
      const saved = await api.post(
        '/admin/media',
        {
          file_name: `${baseName}-${Date.now()}.${isPng ? 'webp' : 'jpg'}`,
          mime_type: outType,
          data_base64: base64,
          alt_text: altText?.() ?? '',
        },
        { auth: true },
      );
      onUploaded(targetKey, saved.url);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const registerInput = (key) => (el) => {
    inputs.current[key] = el;
  };

  const pick = (key) => () => inputs.current[key]?.click();

  return { busyKey, compressAndUpload, registerInput, pick };
}

/**
 * Image picker + preview. `shape` picks the preview aspect:
 * "wide" (16:9, content covers) or "square" (1:1, people).
 */
export function ImageField({
  label,
  value,
  onChange,
  upload,
  fieldKey,
  shape = 'wide',
  hint,
  accept = 'image/*',
}) {
  const isSquare = shape === 'square';
  const busy = upload.busyKey === fieldKey;
  return (
    <div className="form-field form-field--full">
      <label>{label}</label>
      <div className="course-image-picker">
        <div className={isSquare ? 'dean-image-preview' : 'course-image-preview'}>
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className="muted">{isSquare ? 'لا توجد صورة' : 'لا توجد صورة'}</span>
          )}
        </div>
        <div className="course-image-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={upload.pick(fieldKey)}
            disabled={busy}
          >
            {busy ? 'جارٍ الرفع…' : value ? 'تغيير الصورة' : 'رفع صورة'}
          </button>
          {value && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange('')}>
              إزالة
            </button>
          )}
        </div>
      </div>
      {hint && <p className="admin-field-hint">{hint}</p>}
      <input
        ref={upload.registerInput(fieldKey)}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          upload.compressAndUpload(file, fieldKey);
        }}
      />
    </div>
  );
}
