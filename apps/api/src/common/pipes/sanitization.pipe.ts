import { PipeTransform, Injectable } from '@nestjs/common';
import { filterXSS } from 'xss';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      return filterXSS(value, {
        whiteList: {}, // strip all HTML tags
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script'],
      });
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const key of Object.keys(value)) {
        sanitized[key] = this.sanitize((value as Record<string, unknown>)[key]);
      }
      return sanitized;
    }

    return value;
  }
}
