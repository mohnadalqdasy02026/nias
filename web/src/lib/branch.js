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

// يقبل اسم الفرع نصًا أو كائن فرع قادم من الـ API
export function isHqBranch(branch) {
  if (!branch) return false;
  if (typeof branch === 'object') {
    if (typeof branch.is_headquarters === 'boolean') return branch.is_headquarters;
    return isHeadquartersName(branchLabel(branch.name_ar));
  }
  return isHeadquartersName(branchLabel(branch));
}

// «الديوان» للمقر الرئيسي و«فرع عدن» لغيره — لا تُكتب أبدًا «فرع الديوان»
export function branchTitle(branch) {
  const label = branchLabel(typeof branch === 'object' ? branch?.name_ar : branch);
  if (!label) return null;
  if (isHqBranch(branch)) return label;
  return label.includes('فرع') ? label : `فرع ${label}`;
}

// «عميد كل الفروع» في الديوان و«مدير الفرع» في باقي الفروع
export function branchHeadRole(branch) {
  return isHqBranch(branch) ? 'عميد كل الفروع' : 'مدير الفرع';
}
