const isCenterName = (name = '') => /^مركز(\s|$)/.test(String(name ?? '').trim());

// كلمة الجهة المسؤولة: «مدير» للمراكز و«عميد» للكليات.
export const collegeHeadWord = (name) => (isCenterName(name) ? 'مدير' : 'عميد');

export const collegeHeadNoun = (name) => (isCenterName(name) ? 'المركز' : 'الكلية');

export const collegeHeadRole = (name) => `${collegeHeadWord(name)} ${name}`;
