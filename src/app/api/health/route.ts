import { NextResponse } from 'next/server';
import { APP_CONFIG, API_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    api: {
      status: 'up' | 'down';
      url: string;
      responseTime?: number;
    };
    database?: {
      status: 'up' | 'down';
      responseTime?: number;
    };
  };
  uptime: number;
}

const startTime = Date.now();

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const checks: HealthCheckResponse['checks'] = {
    api: {
      status: 'down',
      url: API_CONFIG.baseUrl,
    },
  };

  try {
    const apiStartTime = Date.now();
    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const apiResponseTime = Date.now() - apiStartTime;

    checks.api = {
      status: response.ok ? 'up' : 'down',
      url: API_CONFIG.baseUrl,
      responseTime: apiResponseTime,
    };
  } catch (error) {
    checks.api.status = 'down';
  }

  const allChecksHealthy = checks.api.status === 'up';
  const status: HealthCheckResponse['status'] = allChecksHealthy
    ? 'healthy'
    : 'degraded';

  const healthCheck: HealthCheckResponse = {
    status,
    timestamp,
    version: APP_CONFIG.version,
    environment: APP_CONFIG.env,
    checks,
    uptime,
  };

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthCheck, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
