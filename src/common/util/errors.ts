import { isEmpty, values } from 'lodash';
import { HttpStatus } from '@nestjs/common';
import {
  defaultCustomMessages,
  E_CUSTOM_ERROR_CODES,
  E_POSTGRES_ERROR_CODES,
} from '../../db/constants';

export const isError = (
  err: any,
  code: keyof typeof E_POSTGRES_ERROR_CODES,
): boolean => {
  if (!err) return false;

  return err.code === E_POSTGRES_ERROR_CODES[code];
};

export const isCustomError = (err: any): boolean => {
  if (!err) return false;

  return values(E_CUSTOM_ERROR_CODES).includes(err.code);
};

export const handleCustomError = (err: any): [string, number] => {
  const code = err.code;
  const message = isEmpty(err.message)
    ? defaultCustomMessages[code]
    : err.message;

  return [message, HttpStatus.BAD_REQUEST];
};
