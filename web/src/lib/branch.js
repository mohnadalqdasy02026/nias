export function branchLabel(nameAr) {
  if (!nameAr) return null;
  let s = String(nameAr)
    .replace(/^المعهد الوطني للعلوم الإدارية\s*[—-]\s*/i, '')
    .replace(/^فرع\s*محافظة\s*/i, 'فرع ')
    .trim();
  if (!s) s = nameAr;
  return s;
}

export function isHeadquartersName(nameAr) {
  return /الديوان|المركز\s*الرئيسي|المقر\s*الرئيسي/i.test(String(nameAr ?? ''));
}