/**
 * MÓDULO INVENTÁRIO - Controller REST API
 */

import { NextFunction, Request, Response } from "express";
import { CadastrarProdutoUseCase } from "../application/use-cases/CadastrarProdutoUseCase";
import { IProdutoRepository } from "../domain/repositories/IProdutoRepository";

export class InventarioController {
  constructor(private produtoRepository: IProdutoRepository) {}

  cadastrarProduto = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const useCase = new CadastrarProdutoUseCase(this.produtoRepository);
      const produto = await useCase.execute({
        ...req.body,
        clinicId: req.body.clinicId || "DEFAULT_CLINIC", // TODO: Extrair do token JWT
      });

      return res.status(201).json({
        success: true,
        data: produto.toObject(),
      });
    } catch (error: any) {
      return next(error);
    }
  };

  listarProdutos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clinicId = (req.query.clinicId as string) || "DEFAULT_CLINIC";
      const filters = {
        categoriaId: req.query.categoriaId as string,
        fornecedorId: req.query.fornecedorId as string,
        ativo: req.query.ativo === "true",
        estoqueBaixo: req.query.estoqueBaixo === "true",
        search: req.query.search as string,
      };

      const produtos = await this.produtoRepository.findByClinic(
        clinicId,
        filters,
      );
      const total = await this.produtoRepository.count(clinicId, filters);

      return res.json({
        success: true,
        data: produtos.map((p) => p.toObject()),
        meta: { total },
      });
    } catch (error: any) {
      return next(error);
    }
  };

  obterProduto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const produto = await this.produtoRepository.findById(id);

      if (!produto) {
        return res.status(404).json({
          success: false,
          error: "Produto não encontrado",
        });
      }

      return res.json({
        success: true,
        data: produto.toObject(),
      });
    } catch (error: any) {
      return next(error);
    }
  };
}
