// Form choices shared by the student form (browser) and the server-side validation.
export const STATES = [
  'Odisha', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
];

export const STREAMS = ['Science', 'Commerce', 'Arts / Humanities', 'Vocational', 'Other'];

export const UG_COURSES = ['B.Sc', 'B.A.', 'B.Com', 'BBA', 'BCA', 'B.Tech / B.E.', 'Other'];

// Subjects offered as B.Sc Honours or Minor in Odisha colleges (Utkal, Ravenshaw, and others).
export const SCIENCE_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Botany', 'Zoology', 'Computer Science', 'Statistics',
  'Electronics', 'Geology', 'Microbiology', 'Biotechnology', 'Environmental Science', 'Other',
];

export const INSTITUTIONS = [
  ['government', 'Government'],
  ['aided', 'Aided / government-supported'],
  ['private', 'Private'],
  ['other', 'Other'],
];

export const GENDERS = [
  ['female', 'Female'],
  ['male', 'Male'],
  ['other', 'Other'],
];

// Background groups that some scholarships are limited to. The student ticks any that apply.
// `label` is shown on the form; `short` is used in the eligibility list.
export const GROUPS = [
  { key: 'minority', label: 'I belong to a notified minority community (Muslim, Christian, Sikh, Buddhist, Jain or Parsi)', short: 'Notified minority community' },
  { key: 'defence', label: 'My parent is an ex-serviceman, or serves in the armed forces or CAPF', short: 'Child of ex-servicemen, armed forces or CAPF personnel' },
  { key: 'bocw', label: 'My parent is a registered construction (BOCW) worker', short: 'Child of a registered construction (BOCW) worker' },
  { key: 'vulnerable', label: 'My family is in a vulnerable group (orphan, single parent, destitute or homeless, HIV/AIDS-affected, PVTG or similar)', short: 'Vulnerable family group (orphan, single parent, destitute, HIV/AIDS-affected, PVTG or similar)' },
];
export const GROUP_KEYS = GROUPS.map((g) => g.key);
