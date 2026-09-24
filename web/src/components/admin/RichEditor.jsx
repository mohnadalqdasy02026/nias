import { useEffect, useRef, useState } from 'react';

const TOOLBAR = [
  { id: 'bold', label: 'عريض', hint: 'ctrl+b', exec: ['bold'] },
  { id: 'italic', label: 'مائل', hint: 'ctrl+i', exec: ['italic'] },
  { id: 'underline', label: 'تحته خط', hint: 'ctrl+u', exec: ['underline'] },
  { id: 'sep' },
  { id: 'h2', label: 'عنوان', exec: ['formatBlock', 'H2'] },
  { id: 'h3', label: 'عنوان فرعي', exec: ['formatBlock', 'H3'] },
  { id: 'p', label: 'فقرة', exec: ['formatBlock', 'P'] },
  { id: 'sep' },
  { id: 'ul', label: 'قائمة نقاط', exec: ['insertUnorderedList'] },
  { id: 'ol', label: 'قائمة مرقّمة', exec: ['insertOrderedList'] },
  { id: 'sep' },
  { id: 'link', label: 'رابط', exec: ['link'] },
  { id: 'clear', label: 'مسح التنسيق', exec: ['removeFormat'] },
];

export default function RichEditor({ value = '', onChange, rows = 10, minHeight }) {
  const ref = useRef(null);
  const focused = useRef(false);
  const [raw, setRaw] = useState(false);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      const target = ref.current.innerHTML ?? '';
      if (target !== value) ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd, arg) => {
    ref.current.focus();
    if (cmd === 'link') {
      const url = window.prompt('رابط الصفحة أو الموقع:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false, arg);
    }
    onChange(ref.current.innerHTML);
  };

  const onPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    document.execCommand('insertText', false, text);
    onChange(ref.current.innerHTML);
  };

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {TOOLBAR.map((b) =>
          b.id === 'sep' ? (
            <span key={b.label ?? b.id} className="rich-editor-sep" />
          ) : (
            <button
              key={b.id}
              type="button"
              title={b.hint ?? b.label}
              className={b.id === 'h2' || b.id === 'h3' ? 'rich-editor-btn--label' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(...b.exec)}
            >
              {b.label}
            </button>
          ),
        )}
        <button
          type="button"
          className={`rich-editor-raw${raw ? ' is-active' : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setRaw((v) => !v)}
        >
          {raw ? 'معاينة' : 'الكود المصدري'}
        </button>
      </div>

      {raw ? (
        <textarea
          className="rich-editor-source"
          dir="ltr"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div
          ref={ref}
          className="rich-editor-area"
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          style={{ minHeight: minHeight || rows * 24 }}
          onInput={() => onChange(ref.current.innerHTML)}
          onFocus={() => { focused.current = true; }}
          onBlur={() => { focused.current = false; }}
          onPaste={onPaste}
        />
      )}
    </div>
  );
}