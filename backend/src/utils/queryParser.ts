export const parseSupabaseQuery = (query: any) => {
  const prismaQuery: any = {};

  if (query.select && query.select !== "*") {
    prismaQuery.select = {};
    query.select.split(",").forEach((field: string) => {
      prismaQuery.select[field.trim()] = true;
    });
  }

  const where: any = {};
  for (const [key, value] of Object.entries(query)) {
    if (
      [
        "select",
        "order",
        "limit",
        "offset",
        "apikey",
        "authorization",
      ].includes(key.toLowerCase())
    )
      continue;

    if (typeof value === "string") {
      if (value.startsWith("eq.")) {
        let val: any = value.replace("eq.", "");
        if (val === "true") val = true;
        if (val === "false") val = false;
        if (!isNaN(Number(val)) && val !== "") val = Number(val);
        where[key] = val;
      } else if (value.startsWith("ilike.*") && value.endsWith("*")) {
        where[key] = {
          contains: value.replace("ilike.*", "").replace("*", ""),
          mode: "insensitive",
        };
      } else if (value.startsWith("in.(")) {
        // in.(val1,val2)
        const vals = value.replace("in.(", "").replace(")", "").split(",");
        where[key] = { in: vals };
      } else if (value.startsWith("gte.")) {
        let val: any = value.replace("gte.", "");
        if (val === "true") val = true;
        if (val === "false") val = false;
        if (!isNaN(Number(val)) && val !== "") val = Number(val);
        where[key] = { gte: val };
      } else if (value.startsWith("lte.")) {
        let val: any = value.replace("lte.", "");
        if (val === "true") val = true;
        if (val === "false") val = false;
        if (!isNaN(Number(val)) && val !== "") val = Number(val);
        where[key] = { lte: val };
      } else if (value.startsWith("gt.")) {
        let val: any = value.replace("gt.", "");
        if (val === "true") val = true;
        if (val === "false") val = false;
        if (!isNaN(Number(val)) && val !== "") val = Number(val);
        where[key] = { gt: val };
      } else if (value.startsWith("lt.")) {
        let val: any = value.replace("lt.", "");
        if (val === "true") val = true;
        if (val === "false") val = false;
        if (!isNaN(Number(val)) && val !== "") val = Number(val);
        where[key] = { lt: val };
      } else if (value.startsWith("neq.")) {
        let val: any = value.replace("neq.", "");
        if (val === "true") val = true;
        if (val === "false") val = false;
        if (!isNaN(Number(val)) && val !== "") val = Number(val);
        where[key] = { not: val };
      }
    }
  }

  if (Object.keys(where).length > 0) {
    prismaQuery.where = where;
  }

  if (query.order) {
    const [field, dir] = query.order.split(".");
    prismaQuery.orderBy = { [field]: dir || "asc" };
  }

  if (query.limit) {
    prismaQuery.take = parseInt(query.limit, 10);
  }

  if (query.offset) {
    prismaQuery.skip = parseInt(query.offset, 10);
  }

  return prismaQuery;
};
