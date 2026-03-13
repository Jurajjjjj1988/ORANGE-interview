import { PersonalDetails } from '../pages/CheckoutPage';

export const TARIFFS = {
  VELKY_PAUSAL: '13092700',
} as const;

export const PHONES = {
  IPHONE_17_PRO_MAX: 'iPhone 17 Pro Max',
} as const;

export const CUSTOMERS = {
  DEFAULT: {
    firstName: 'Ján',
    lastName: 'Testovací',
    phone: '0901234567',
    email: 'jan.testovaci@mailinator.com',
    citySearch: 'Bratislava',
    citySelect: 'Bratislava',
    streetSearch: 'Hlavná',
    streetSelect: 'Hlavná',
    streetNumber: '1',
  } satisfies PersonalDetails,
} as const;
