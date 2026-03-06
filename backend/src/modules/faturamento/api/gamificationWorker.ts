import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class GamificationWorkerController {
  async processGoalsAndRankings(_req: Request, res: Response): Promise<void> {
    try {
      console.log("[Gamificacao] Iniciando processamento de metas e rankings");

      // Buscar todas as clínicas ativas
      const clinics = await (prisma as any).clinics.findMany({
        select: { id: true },
      });

      for (const clinic of clinics) {
        console.log(`[Gamificacao] Processando clinica: ${clinic.id}`);

        // Buscar metas ativas
        const metas = await (prisma as any).vendedor_metas.findMany({
          where: {
            clinic_id: clinic.id,
            status: "EM_ANDAMENTO",
            periodo_inicio: { lte: new Date() },
            periodo_fim: { gte: new Date() },
          },
        });

        for (const meta of metas) {
          // Buscar vendas finalizadas
          const vendas = await (prisma as any).pdv_vendas.findMany({
            where: {
              clinic_id: clinic.id,
              created_by: meta.vendedor_id,
              status: "FINALIZADA",
              created_at: {
                gte: meta.periodo_inicio,
                lte: meta.periodo_fim,
              },
            },
            select: { valor_total: true },
          });

          const valor_atingido = vendas.reduce(
            (sum: number, v: any) => sum + parseFloat(v.valor_total || 0),
            0,
          );
          const quantidade_atingida = vendas.length;
          const percentual_atingido = (valor_atingido / meta.meta_valor) * 100;

          let status = "EM_ANDAMENTO";
          if (new Date() > new Date(meta.periodo_fim)) {
            if (percentual_atingido >= 100) {
              status = percentual_atingido >= 120 ? "SUPERADA" : "ATINGIDA";
            } else {
              status = "NAO_ATINGIDA";
            }
          }

          // Atualizar meta
          await (prisma as any).vendedor_metas.update({
            where: { id: meta.id },
            data: {
              valor_atingido,
              quantidade_atingida,
              percentual_atingido,
              status,
            },
          });

          // Premiacao
          if (
            (status === "ATINGIDA" || status === "SUPERADA") &&
            !meta.premiacao_paga
          ) {
            const premiacao = await (
              prisma as any
            ).vendedor_premiacoes.findFirst({
              where: {
                clinic_id: clinic.id,
                ativo: true,
                percentual_meta_minimo: { lte: percentual_atingido },
              },
              orderBy: { percentual_meta_minimo: "desc" },
            });

            if (premiacao) {
              await (prisma as any).vendedor_metas.update({
                where: { id: meta.id },
                data: {
                  premiacao_id: premiacao.id,
                  premiacao_paga: false,
                },
              });

              await (prisma as any).audit_logs.create({
                data: {
                  clinic_id: clinic.id,
                  user_id: meta.vendedor_id,
                  action: "META_ATINGIDA",
                  details: {
                    meta_id: meta.id,
                    premiacao_id: premiacao.id,
                    percentual_atingido,
                    tipo_premiacao: premiacao.tipo,
                  },
                },
              });
            }
          }
        }

        // Rankings
        const hoje = new Date();
        const periodos = [
          { nome: "DIA", data: hoje.toISOString().split("T")[0] },
          { nome: "SEMANA", data: hoje.toISOString().split("T")[0] },
          { nome: "MES", data: hoje.toISOString().split("T")[0] },
        ];

        for (const periodo of periodos) {
          let dataInicio = new Date(hoje);
          if (periodo.nome === "DIA") {
            dataInicio.setHours(0, 0, 0, 0);
          } else if (periodo.nome === "SEMANA") {
            dataInicio.setDate(hoje.getDate() - 7);
          } else if (periodo.nome === "MES") {
            dataInicio.setMonth(hoje.getMonth() - 1);
          }

          const vendasPeriodo = await (prisma as any).pdv_vendas.findMany({
            where: {
              clinic_id: clinic.id,
              status: "FINALIZADA",
              created_at: { gte: dataInicio },
            },
            select: { created_by: true, valor_total: true },
          });

          const vendedoresMap = new Map();
          vendasPeriodo.forEach((venda: any) => {
            if (!vendedoresMap.has(venda.created_by)) {
              vendedoresMap.set(venda.created_by, {
                total_vendas: 0,
                quantidade_vendas: 0,
              });
            }
            const v = vendedoresMap.get(venda.created_by);
            v.total_vendas += parseFloat(venda.valor_total || 0);
            v.quantidade_vendas += 1;
          });

          const ranking = Array.from(vendedoresMap.entries())
            .map(([vendedor_id, stats]: [string, any]) => ({
              vendedor_id,
              total_vendas: stats.total_vendas,
              quantidade_vendas: stats.quantidade_vendas,
              ticket_medio: stats.total_vendas / stats.quantidade_vendas,
            }))
            .sort((a, b) => b.total_vendas - a.total_vendas);

          for (let i = 0; i < ranking.length; i++) {
            const vendedor = ranking[i];
            const posicao = i + 1;
            let badge = null;
            if (posicao === 1) badge = "OURO";
            else if (posicao === 2) badge = "PRATA";
            else if (posicao === 3) badge = "BRONZE";

            const pontos =
              Math.floor(vendedor.total_vendas / 10) +
              vendedor.quantidade_vendas * 5;

            // Simplified upsert equivalent for sqlite/postgresql (this may need true upsert logic)
            // Assuming there's a unique constraint on clinic_id,vendedor_id,periodo,data_referencia
            const existing = await (prisma as any).vendedor_ranking.findFirst({
              where: {
                clinic_id: clinic.id,
                vendedor_id: vendedor.vendedor_id,
                periodo: periodo.nome,
                data_referencia: periodo.data,
              },
            });

            if (existing) {
              await (prisma as any).vendedor_ranking.update({
                where: { id: existing.id },
                data: {
                  posicao,
                  pontos,
                  total_vendas: vendedor.total_vendas,
                  quantidade_vendas: vendedor.quantidade_vendas,
                  ticket_medio: vendedor.ticket_medio,
                  badge,
                },
              });
            } else {
              await (prisma as any).vendedor_ranking.create({
                data: {
                  clinic_id: clinic.id,
                  vendedor_id: vendedor.vendedor_id,
                  periodo: periodo.nome,
                  data_referencia: periodo.data,
                  posicao,
                  pontos,
                  total_vendas: vendedor.total_vendas,
                  quantidade_vendas: vendedor.quantidade_vendas,
                  ticket_medio: vendedor.ticket_medio,
                  badge,
                },
              });
            }
          }
        }
      }

      res
        .status(200)
        .json({ success: true, message: "Processamento concluído" });
    } catch (error: any) {
      console.error("[Gamificacao] Erro:", error);
      res.status(500).json({ error: error.message || "Erro desconhecido" });
    }
  }
}
