import { isEmpty, isEmptyArray, isNullOrUndefined } from './index'

// 👉 Required Validator
export const requiredValidator = (value: unknown) => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'This field is required'

  return !!String(value).trim().length || 'This field is required'
}

// 👉 Email Validator
export const emailValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || 'The Email field must be a valid email'

  return re.test(String(value)) || 'The Email field must be a valid email'
}

// 👉 Password Validator
export const passwordValidator = (password: string) => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/

  const validPassword = regExp.test(password)

  return (
    // eslint-disable-next-line operator-linebreak
    validPassword ||
    'Field must contain at least one uppercase, lowercase, special character and digit with min 8 chars'
  )
}

// 👉 Confirm Password Validator
export const confirmedValidator = (value: string, target: string) =>

  value === target || 'The Confirm Password field confirmation does not match'

// 👉 Between Validator
export const betweenValidator = (value: unknown, min: number, max: number) => {
  const valueAsNumber = Number(value);

  if (!isNaN(valueAsNumber) && valueAsNumber >= min && valueAsNumber <= max) {
    return true; // Value is within the range
  } else {
    return false; // Value is outside the range or not a valid number
  }
};

export const stringLengthBetweenValidator = (value: string, min: number, max: number) => {
  const length = String(value).length;

  if (length >= min && length <= max) return true
  else return `Characters length must be between ${min} and ${max} characters`
};

export const stringLengthMinValidator = (value: string, min: number) => {
  const length = String(value).length;

  if (length >= min) return true
  else return `Characters length must be between ${min} characters`
};


// 👉 Integer Validator
export const integerValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  if (Array.isArray(value))
    return value.every(val => /^-?[0-9]+$/.test(String(val))) || 'This field must be an integer'

  return /^-?[0-9]+$/.test(String(value)) || 'This field must be an integer'
}

// 👉 Regex Validator
export const regexValidator = (value: unknown, regex: RegExp | string): string | boolean => {
  if (isEmpty(value))
    return true

  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)

  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))

  return regeX.test(String(value)) || 'The Regex field format is invalid'
}

// 👉 Alpha Validator
export const alphaValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  return /^[A-Z&\s]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters, spaces, and & character';
}

// 👉 URL Validator
export const urlValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  const re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/

  return re.test(String(value)) || 'URL is invalid'
}

// 👉 Length Validator
export const lengthValidator = (value: unknown, length: number) => {
  if (isEmpty(value))
    return true

  return String(value).length >= length || `The Min Character field must be at least ${length} characters`
}

// 👉 Alpha-dash Validator
export const alphaDashValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  const valueAsString = String(value)

  return /^[0-9A-Z_-]*$/i.test(valueAsString) || 'All Character are not valid'
}

export const alphaDashWithoutNumberValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  const valueAsString = String(value)

  return /^[A-Z_-]*$/i.test(valueAsString) || 'All Character and numbers are not valid'
}


// 👉 Currency Indonesia Validator
export const currencyIndonesiaValidator = (value: unknown) => {
  if (isEmpty(value)) {
    return true; // Empty value is considered valid
  }

  const valueAsString = String(value);

  // Regular expression to validate Indonesian currency format (e.g., "10.000" or "1.000.000")
  const currencyRegex = /^(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)$/;

  return currencyRegex.test(valueAsString) || 'Invalid Indonesian currency format';
};

// 👉 Currency Indonesia Validator
export const currencyIndonesiaBetweenValidator = (value: unknown, min: number, max: number) => {
  if (isEmpty(value)) {
    return true; // Empty value is considered valid
  }

  const valueAsNumber = +String(value).replaceAll('.', '')

  if (valueAsNumber >= Number(min) && valueAsNumber <= Number(max)) return true
  else return `Input limit must be between ${new Intl.NumberFormat('id-ID', { currency: 'IDR', style: 'currency' }).format(min)} and ${new Intl.NumberFormat('id-ID', { currency: 'IDR', style: 'currency' }).format(max)} limit`
};

export const integerBetweenValidator = (value: string, min: number, max: number) => {
  if (!/^\s*[0-9]+\s*(?:[0-9]+\s*)*$/g.test(value)) {
    return 'Input must be a valid integer';
  }

  const valueLength = value.trim().length;

  if (isNaN(valueLength) || !Number.isInteger(valueLength)) {
    return 'Input must be a valid integer';
  }

  if (valueLength >= Number(min) && valueLength <= Number(max)) {
    return true;
  } else {
    return `Input must be between ${min} and ${max}`;
  }
};
