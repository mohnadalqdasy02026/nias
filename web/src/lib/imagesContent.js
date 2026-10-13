export const DEFAULT_IMAGES = {
  logo: '/uploads/design/site/logo.jpg',
  program_bachelor: '/uploads/design/site/main_1786788776_852.jpg',
  program_master: '/uploads/design/site/main_1783197092_280.jpg',
  program_diploma: '/uploads/design/site/main_1782830791_165.jpg',
  course_cover: '/uploads/design/site/main_1786901865_894.jpg',
  college_default: '/uploads/design/site/logo.jpg',
  og_image: '/uploads/design/site/main_1787497216_201.jpg',
};

export function programCoverFor(images, programType) {
  if (programType === 'bachelor') return images?.program_bachelor || DEFAULT_IMAGES.program_bachelor;
  if (programType === 'diploma') return images?.program_diploma || DEFAULT_IMAGES.program_diploma;
  return images?.program_master || DEFAULT_IMAGES.program_master;
}
