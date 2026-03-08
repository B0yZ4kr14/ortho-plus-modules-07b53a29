import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class VolatilityWorkerController {
  async processVolatilityAlerts(_req: Request, res: Response): Promise<void> {
    try {
      

      // Fetch active volatility alerts
      const alerts = await (prisma as any).crypto_price_alerts.findMany({
        where: {
          alert_type: "VOLATILITY",
          is_active: true,
        },
      });

      if (!alerts || alerts.length === 0) {
        res.status(200).json({ message: "No active alerts" });
        return;
      }

      const coinIds: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDT: "tether",
        BNB: "binancecoin",
        USDC: "usd-coin",
      };

      const triggeredAlerts = [];

      for (const alert of alerts) {
        const coinId = coinIds[alert.coin_type];
        if (!coinId) continue;

        const timeframeMinutes = alert.volatility_timeframe_minutes || 60;
        const thresholdPercentage = alert.volatility_threshold_percentage || 5;
        const direction = alert.volatility_direction || "both";

        const toTimestamp = Math.floor(Date.now() / 1000);
        const fromTimestamp = toTimestamp - timeframeMinutes * 60;

        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=brl&from=${fromTimestamp}&to=${toTimestamp}`,
          );

          if (!response.ok) continue;

          const data = (await response.json()) as any;
          const prices = data.prices as [number, number][];

          if (!prices || prices.length < 2) continue;

          const firstPrice = prices[0][1];
          const lastPrice = prices[prices.length - 1][1];
          const changePercentage =
            ((lastPrice - firstPrice) / firstPrice) * 100;

          let shouldTrigger = false;

          if (direction === "up" && changePercentage >= thresholdPercentage) {
            shouldTrigger = true;
          } else if (
            direction === "down" &&
            changePercentage <= -thresholdPercentage
          ) {
            shouldTrigger = true;
          } else if (
            direction === "both" &&
            Math.abs(changePercentage) >= thresholdPercentage
          ) {
            shouldTrigger = true;
          }

          if (shouldTrigger) {
            // Update last_triggered_at
            await (prisma as any).crypto_price_alerts.update({
              where: { id: alert.id },
              data: { last_triggered_at: new Date() },
            });

            // Create notification
            await (prisma as any).notifications.create({
              data: {
                clinic_id: alert.clinic_id,
                tipo: "CRIPTO_VOLATILIDADE",
                titulo: `Alerta de Volatilidade: ${alert.coin_type}`,
                mensagem: `${alert.coin_type} variou ${changePercentage >= 0 ? "+" : ""}${changePercentage.toFixed(2)}% em ${timeframeMinutes} minutos. Preço atual: R$ ${lastPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                link_acao: "/financeiro/crypto-pagamentos",
              },
            });

            triggeredAlerts.push({
              coin: alert.coin_type,
              change: changePercentage,
              timeframe: timeframeMinutes,
            });
          }
        } catch (error) {
          console.error(
            `Error processing alert for ${alert.coin_type}:`,
            error,
          );
        }
      }

      res.status(200).json({
        success: true,
        triggeredAlerts,
        message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length}`,
      });
    } catch (error: any) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  }
}
