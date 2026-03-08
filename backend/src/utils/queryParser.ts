type PrimitiveValue = string | number | boolean;

type PrismaWhereCondition =
  | PrimitiveValue
  | { contains: string; mode: 'insensitive' }
  | { in: string[] }
  | { gte: PrimitiveValue }
  | { lte: PrimitiveValue }
  | { gt: PrimitiveValue }
  | { lt: PrimitiveValue }
  | { not: PrimitiveValue };

interface PrismaQuery {
  select?: Record<string, true>;
  where?: Record<string, PrismaWhereCondition>;
  orderBy?: Record<string, string>;
  take?: number;
  skip?: number;
}

const RESERVED_KEYS = new Set(['select', 'order', 'limit', 'offset', 'apikey', 'authorization']);

/** Parse URL query value into a typed primitive (boolean / number / string). */
function coerce(raw: string, key: string): PrimitiveValue {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (!isNaN(Number(raw)) && raw !== '' && !key.endsWith('_id') && key !== 'id') {
    return Number(raw);
  }
  return raw;
}

export const parseRestQuery = (query: Record<string, string>): PrismaQuery => {
  const prismaQuery: PrismaQuery = {};

  if (query.select && query.select !== '*') {
    prismaQuery.select = {};
    query.select.split(',').forEach((field: string) => {
      prismaQuery.select![field.trim()] = true;
    });
  }

  const where: Record<string, PrismaWhereCondition> = {};

  for (const [key, value] of Object.entries(query)) {
    if (RESERVED_KEYS.has(key.toLowerCase())) continue;

    if (typeof value === 'string') {
      if (value.startsWith('eq.')) {
        where[key] = coerce(value.replace('eq.', ''), key);
      } else if (value.startsWith('ilike.*') && value.endsWith('*')) {
        where[key] = {
          contains: value.replace('ilike.*', '').replace('*', ''),
          mode: 'insensitive',
        };
      } else if (value.startsWith('in.(')) {
        const vals = value.replace('in.(', '').replace(')', '').split(',');
        where[key] = { in: vals };
      } else if (value.startsWith('gte.')) {
        where[key] = { gte: coerce(value.replace('gte.', ''), key) };
      } else if (value.startsWith('lte.')) {
        where[key] = { lte: coerce(value.replace('lte.', ''), key) };
      } else if (value.startsWith('gt.')) {
        where[key] = { gt: coerce(value.replace('gt.', ''), key) };
      } else if (value.startsWith('lt.')) {
        where[key] = { lt: coerce(value.replace('lt.', ''), key) };
      } else if (value.startsWith('neq.')) {
        where[key] = { not: coerce(value.replace('neq.', ''), key) };
      }
    }
  }

  if (Object.keys(where).length > 0) {
    prismaQuery.where = where;
  }

  if (query.order) {
    const [field, dir] = query.order.split('.');
    prismaQuery.orderBy = { [field]: dir || 'asc' };
  }

  if (query.limit) {
    prismaQuery.take = parseInt(query.limit, 10);
  }

  if (query.offset) {
    prismaQuery.skip = parseInt(query.offset, 10);
  }

  return prismaQuery;
};
