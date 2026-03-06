/**
 * Sistema Praxeológico de Error Handling para Edge Functions
 * Implementa logging estruturado, severidade de erros e audit trail
 */

export enum ErrorSeverity {
  LOW = 'LOW',           // Erro esperado, não crítico (ex: validação)
  MEDIUM = 'MEDIUM',     // Erro que impede operação mas sistema estável
  HIGH = 'HIGH',         // Erro que afeta múltiplos usuários
  CRITICAL = 'CRITICAL'  // Erro que pode causar perda de dados ou downtime
}

export class PraxeologicalError extends Error {
  public statusCode: number;
  public code: string;
  public severity: ErrorSeverity;
  public context?: Record<string, any>;
  public userMessage?: string;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    severity: ErrorSeverity,
    context?: Record<string, any>,
    userMessage?: string
  ) {
    super(message);
    this.name = 'PraxeologicalError';
    this.statusCode = statusCode;
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.userMessage = userMessage;
  }
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    severity: ErrorSeverity;
    timestamp: string;
    request_id?: string;
  };
  context?: Record<string, any>;
}

/**
 * Handler centralizado para todos os erros de Edge Functions
 */
export const handleError = (
  error: unknown,
  requestId?: string,
  userId?: string,
  clinicId?: string
): Response => {
  const timestamp = new Date().toISOString();

  // Erro praxeológico customizado
  if (error instanceof PraxeologicalError) {
    const errorResponse: ErrorResponse = {
      error: {
        code: error.code,
        message: error.userMessage || error.message,
        severity: error.severity,
        timestamp,
        request_id: requestId,
      },
      context: error.context,
    };

    // Log estruturado
    console.error(JSON.stringify({
      level: 'ERROR',
      severity: error.severity,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      timestamp,
      request_id: requestId,
      user_id: userId,
      clinic_id: clinicId,
      context: error.context,
      stack: error.stack,
    }));

    // Se erro crítico, acionar alerta
    if (error.severity === ErrorSeverity.CRITICAL) {
      console.error(`🚨 CRITICAL ERROR: ${error.code} - ${error.message}`);
    }

    return new Response(JSON.stringify(errorResponse), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Erro nativo JavaScript/TypeScript
  if (error instanceof Error) {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
        severity: ErrorSeverity.CRITICAL,
        timestamp,
        request_id: requestId,
      },
    };

    console.error(JSON.stringify({
      level: 'ERROR',
      severity: ErrorSeverity.CRITICAL,
      code: 'UNHANDLED_ERROR',
      message: error.message,
      timestamp,
      request_id: requestId,
      user_id: userId,
      clinic_id: clinicId,
      stack: error.stack,
    }));

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Erro desconhecido
  const errorResponse: ErrorResponse = {
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'Erro desconhecido. Contate o suporte.',
      severity: ErrorSeverity.CRITICAL,
      timestamp,
      request_id: requestId,
    },
  };

  console.error(JSON.stringify({
    level: 'ERROR',
    severity: ErrorSeverity.CRITICAL,
    code: 'UNKNOWN_ERROR',
    error: String(error),
    timestamp,
    request_id: requestId,
    user_id: userId,
    clinic_id: clinicId,
  }));

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Wrapper para try-catch com error handling praxeológico
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  requestId?: string,
  userId?: string,
  clinicId?: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    throw handleError(error, requestId, userId, clinicId);
  }
};
