export function branchLabel(nameAr) {
  if (!nameAr) return null;
  let s = String(nameAr)
    .replace(/^المعهد الوطني للعلوم الإدارية\s*[—-]\s*/i, '')
    .replace(/^فرع\s*محافظة\s*/i, '')
    .replace(/^فرع\s*الرئيسي\s*/i, '')
    .replace(/^الديوان\s*العام\s*/i, '')
    .replace(/^فرع\s*/i, '')
    .trim();
  if (!s) s = nameAr;
  return s;
}

export function isHeadquartersName(nameAr) {
  return /الديوان\s*العام/i.test(String(nameAr ?? ''));
}

export function isHqBranch(branch) {
  if (!branch) return false;
  if (typeof branch === 'object') {
    if (typeof branch.is_headquarters === 'boolean') return branch.is_headquarters;
    return isHeadquartersName(branchLabel(branch.name_ar));
  }
  return isHeadquartersName(branchLabel(branch));
}

export function branchTitle(branch) {
  const label = branchLabel(typeof branch === 'object' ? branch?.name_ar : branch);
  if (!label) return null;
  if (isHqBranch(branch)) return 'الديوان العام';
  return `فرع ${label}`;
}

export function branchHeadRole(branch) {
  return isHqBranch(branch) ? 'مدير الديوان العام' : 'مدير الفرع';
}