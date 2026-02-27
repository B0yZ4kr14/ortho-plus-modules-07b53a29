import { Request, Response } from "express";
import { parseSupabaseQuery } from "../utils/queryParser";
import prisma from "../utils/prisma";

const getModel = (tableName: string) => {
  return (prisma as any)[tableName];
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { table } = req.params;
    const model = getModel(table);
    if (!model) {
        res.status(404).json({ error: `Table ${table} not found` });
        return;
    }

    const queryArgs = parseSupabaseQuery(req.query);
    const data = await model.findMany(queryArgs);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { table, id } = req.params;
    const model = getModel(table);
    if (!model) {
        res.status(404).json({ error: `Table ${table} not found` });
        return;
    }

    const parsedId = isNaN(Number(id)) ? id : Number(id);
    const data = await model.findUnique({ where: { id: parsedId } });
    if (!data) {
        res.status(404).json({ error: "Not found" });
        return;
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { table } = req.params;
    const model = getModel(table);
    if (!model) {
        res.status(404).json({ error: `Table ${table} not found` });
        return;
    }
    const data = await model.create({ data: req.body });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { table, id } = req.params;
    const model = getModel(table);
    if (!model) {
        res.status(404).json({ error: `Table ${table} not found` });
        return;
    }

    const parsedId = isNaN(Number(id)) ? id : Number(id);
    const data = await model.update({
      where: { id: parsedId },
      data: req.body
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { table, id } = req.params;
    const model = getModel(table);
    if (!model) {
        res.status(404).json({ error: `Table ${table} not found` });
        return;
    }

    const parsedId = isNaN(Number(id)) ? id : Number(id);
    await model.delete({ where: { id: parsedId } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
