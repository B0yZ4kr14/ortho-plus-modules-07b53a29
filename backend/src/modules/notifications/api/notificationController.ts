import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export class NotificationController {
  /**
   * Auto Notifications (Cron-like endpoint)
   * Handles: upcoming appointments, overdue payments, low stock, birthdays
   */
  async runAutoNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Running auto-notifications scheduler...");
      let notificationsCreated = 0;

      // 1. Appointments tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
      const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

      const upcomingAppointments = await prisma.$queryRaw<any[]>`
        SELECT a.*, p.full_name as patient_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        WHERE a.start_time >= ${tomorrowStart} AND a.start_time <= ${tomorrowEnd}
        AND a.status = 'agendado'
      `;

      for (const app of upcomingAppointments) {
        await prisma.$queryRaw`
          INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
          VALUES (${app.clinic_id}, 'CONSULTA', 'Consulta Amanhã',
          'Consulta agendada com ' || COALESCE(${app.patient_name}, 'paciente'), '/agenda')
        `;
        notificationsCreated++;
      }

      // 2. Overdue payments
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overduePayments = await prisma.$queryRaw<any[]>`
        SELECT cr.*, p.full_name as patient_name
        FROM contas_receber cr
        LEFT JOIN patients p ON cr.patient_id = p.id
        WHERE cr.data_vencimento < ${today}
        AND cr.status IN ('PENDENTE', 'ATRASADO')
      `;

      for (const payment of overduePayments) {
        await prisma.$queryRaw`
          INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
          VALUES (${payment.clinic_id}, 'PAGAMENTO', 'Pagamento Vencido',
          'Pagamento vencido - Paciente: ' || COALESCE(${payment.patient_name}, 'N/A'), '/financeiro/contas-receber')
        `;
        notificationsCreated++;
      }

      // 3. Low stock
      const lowStockProducts = await prisma.$queryRaw<any[]>`
        SELECT * FROM estoque_produtos WHERE quantidade_atual <= quantidade_minima
      `;

      for (const product of lowStockProducts) {
        await prisma.$queryRaw`
          INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
          VALUES (${product.clinic_id}, 'ALERTA', 'Estoque Baixo',
          'Produto "' || ${product.nome} || '" com estoque baixo (' || ${product.quantidade_atual} || ' un)', '/estoque')
        `;
        notificationsCreated++;
      }

      // 4. Birthdays
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      const birthdayPatients = await prisma.$queryRaw<any[]>`
        SELECT p.*, pat.full_name as patient_name
        FROM prontuarios p
        JOIN patients pat ON p.patient_id = pat.id
        WHERE EXTRACT(MONTH FROM p.data_nascimento) = ${todayMonth}
        AND EXTRACT(DAY FROM p.data_nascimento) = ${todayDay}
      `;

      for (const patient of birthdayPatients) {
        await prisma.$queryRaw`
          INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
          VALUES (${patient.clinic_id}, 'LEMBRETE', '🎂 Aniversariante do Dia',
          'Hoje é aniversário de ' || COALESCE(${patient.patient_name}, 'um paciente') || '!', '/pacientes')
        `;
        notificationsCreated++;
      }

      res.json({
        success: true,
        notificationsCreated,
        message: `Created ${notificationsCreated} automatic notifications`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a single notification
   */
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { clinic_id, user_id, tipo, titulo, mensagem, link_acao } =
        req.body;

      if (!clinic_id || !tipo || !titulo || !mensagem) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const notif = await prisma.$queryRaw<any[]>`
        INSERT INTO notifications (clinic_id, user_id, tipo, titulo, mensagem, link_acao)
        VALUES (${clinic_id}, ${user_id || null}, ${tipo}, ${titulo}, ${mensagem}, ${link_acao || null})
        RETURNING *
      `;

      await prisma.$queryRaw`
        INSERT INTO audit_logs (clinic_id, user_id, action, details)
        VALUES (${clinic_id}, ${user_id || null}, 'NOTIFICATION_CREATED', ${JSON.stringify({ tipo, titulo, notification_id: notif[0].id })}::jsonb)
      `;

      res.json({ success: true, notification: notif[0] });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check volatility alerts
   */
  async checkVolatilityAlerts(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const alerts = await prisma.$queryRaw<any[]>`
        SELECT * FROM crypto_price_alerts
        WHERE alert_type = 'VOLATILITY' AND is_active = true
      `;

      if (!alerts || alerts.length === 0) {
        res.json({ message: "No active alerts" });
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
          if (direction === "up" && changePercentage >= thresholdPercentage)
            shouldTrigger = true;
          else if (
            direction === "down" &&
            changePercentage <= -thresholdPercentage
          )
            shouldTrigger = true;
          else if (
            direction === "both" &&
            Math.abs(changePercentage) >= thresholdPercentage
          )
            shouldTrigger = true;

          if (shouldTrigger) {
            await prisma.$queryRaw`
              UPDATE crypto_price_alerts SET last_triggered_at = NOW() WHERE id = ${alert.id}
            `;

            await prisma.$queryRaw`
              INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
              VALUES (${alert.clinic_id}, 'CRIPTO_VOLATILIDADE', 'Alerta de Volatilidade: ' || ${alert.coin_type},
              ${alert.coin_type} || ' variou ' || ${changePercentage.toFixed(2)} || '%', '/financeiro/crypto-pagamentos')
            `;

            triggeredAlerts.push({
              coin: alert.coin_type,
              change: changePercentage,
              timeframe: timeframeMinutes,
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      res.json({
        success: true,
        triggeredAlerts,
        message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check crypto price alerts
   */
  async checkCryptoPriceAlerts(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const alerts = await prisma.$queryRaw<any[]>`
        SELECT cpa.*, p.email
        FROM crypto_price_alerts cpa
        LEFT JOIN profiles p ON cpa.created_by = p.id
        WHERE cpa.is_active = true
      `;

      if (!alerts || alerts.length === 0) {
        res.json({ message: "No active alerts to process" });
        return;
      }

      let alertsTriggered = 0;
      let alertsSent = 0;

      for (const alert of alerts) {
        if (alert.cascade_enabled && alert.cascade_order > 1) {
          const previousAlerts = await prisma.$queryRaw<any[]>`
            SELECT id FROM crypto_price_alerts
            WHERE cascade_group_id = ${alert.cascade_group_id}
            AND cascade_order < ${alert.cascade_order}
            AND last_triggered_at IS NULL
          `;
          if (previousAlerts.length > 0) continue;
        }

        const latestRate = await prisma.$queryRaw<any[]>`
          SELECT rate_brl FROM crypto_exchange_rates
          WHERE coin_type = ${alert.coin_type}
          ORDER BY timestamp DESC LIMIT 1
        `;

        if (!latestRate || latestRate.length === 0) continue;
        const currentRate = latestRate[0].rate_brl;

        let shouldTrigger = false;
        if (
          alert.alert_type === "ABOVE" &&
          currentRate >= alert.target_rate_brl
        )
          shouldTrigger = true;
        else if (
          alert.alert_type === "BELOW" &&
          currentRate <= alert.target_rate_brl
        )
          shouldTrigger = true;

        if (!shouldTrigger) continue;

        if (alert.last_triggered_at) {
          const hours =
            (Date.now() - new Date(alert.last_triggered_at).getTime()) /
            (1000 * 60 * 60);
          if (hours < 24) continue;
        }

        alertsTriggered++;

        if (
          alert.notification_method &&
          alert.notification_method.includes("EMAIL") &&
          alert.email
        ) {
          try {
            await resend.emails.send({
              from: "Ortho+ <onboarding@resend.dev>",
              to: [alert.email],
              subject: `Alerta de Taxa ${alert.coin_type}`,
              html: `<p>Taxa atingida: ${currentRate}</p>`,
            });
            alertsSent++;
          } catch (e) {
            console.error("Failed to send email", e);
          }
        }

        await prisma.$queryRaw`
          UPDATE crypto_price_alerts SET last_triggered_at = NOW() WHERE id = ${alert.id}
        `;

        await prisma.$queryRaw`
          INSERT INTO notifications (clinic_id, user_id, tipo, titulo, mensagem, link_acao)
          VALUES (${alert.clinic_id}, ${alert.created_by}, 'CRYPTO_ALERT', 'Taxa ' || ${alert.coin_type} || ' Atingida',
          'A taxa atingiu ' || ${currentRate}, '/financeiro/crypto-pagamentos')
        `;
      }

      res.json({ success: true, alertsTriggered, alertsSent });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send Replenishment Alerts (AI generated)
   */
  async sendReplenishmentAlerts(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { previsoes, resumo } = req.body;

      if (!previsoes || previsoes.length === 0) {
        res.status(400).json({ error: "Nenhuma previsão fornecida" });
        return;
      }

      const clinic_id = (req as any).clinic_id;
      const user_id = (req as any).user?.id || null;

      const admins = await prisma.$queryRaw<any[]>`
        SELECT email FROM profiles WHERE clinic_id = ${clinic_id} AND role = 'ADMIN'
        /* Note: role logic simplified for mock */
      `;

      const adminEmails = admins.map((a) => a.email).filter(Boolean);

      if (adminEmails.length > 0) {
        const produtosCriticos = previsoes.filter(
          (p: any) => p.status === "CRITICO",
        );
        const produtosAlerta = previsoes.filter(
          (p: any) => p.status === "ALERTA",
        );

        try {
          await resend.emails.send({
            from: "Ortho+ Estoque <onboarding@resend.dev>",
            to: adminEmails,
            subject: `🤖 Alerta de Reposição IA: ${produtosCriticos.length} Críticos, ${produtosAlerta.length} Alertas`,
            html: `<p>Verifique o estoque no sistema. Detalhes: ${JSON.stringify(resumo)}</p>`,
          });
        } catch (e) {
          console.error("Email failed", e);
        }

        await prisma.$queryRaw`
          INSERT INTO audit_logs (clinic_id, user_id, action, details)
          VALUES (${clinic_id}, ${user_id}, 'ALERTAS_REPOSICAO_ENVIADOS', ${JSON.stringify({ total_produtos: previsoes.length })}::jsonb)
        `;
      }

      res.json({
        success: true,
        message: `Alertas enviados para ${adminEmails.length} gestores`,
        destinatorios: adminEmails.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send Stock Alerts
   */
  async sendStockAlerts(_req: Request, res: Response, next: NextFunction) {
    try {
      const produtos = await prisma.$queryRaw<any[]>`
        SELECT id, nome, quantidade_atual, quantidade_minima, clinic_id
        FROM estoque_produtos
        WHERE quantidade_atual <= quantidade_minima
      `;

      if (!produtos || produtos.length === 0) {
        res.json({ message: "Nenhum alerta de estoque encontrado" });
        return;
      }

      const alertasEnviados = [];

      for (const p of produtos) {
        const tipoAlerta =
          p.quantidade_atual === 0 ? "ESTOQUE_CRITICO" : "ESTOQUE_MINIMO";
        const msg =
          p.quantidade_atual === 0
            ? `CRÍTICO: ${p.nome} sem estoque!`
            : `Estoque mínimo: ${p.nome}`;

        await prisma.$queryRaw`
          INSERT INTO estoque_alertas (produto_id, tipo, mensagem, quantidade_atual, quantidade_sugerida, lido)
          VALUES (${p.id}, ${tipoAlerta}, ${msg}, ${p.quantidade_atual}, ${p.quantidade_minima * 2}, false)
        `;

        await prisma.$queryRaw`
          INSERT INTO audit_logs (clinic_id, action, details)
          VALUES (${p.clinic_id}, 'STOCK_ALERT_SENT', ${JSON.stringify({ produto: p.nome, tipo_alerta: tipoAlerta })}::jsonb)
        `;

        alertasEnviados.push({
          produto: p.nome,
          clinic_id: p.clinic_id,
          tipo: tipoAlerta,
        });
      }

      res.json({
        success: true,
        alertas_enviados: alertasEnviados.length,
        detalhes: alertasEnviados,
      });
    } catch (error) {
      next(error);
    }
  }
}
