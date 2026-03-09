import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WebhookLog {
  event_message: string;
  event_type: string;
  level: 'info' | 'error' | 'warn' | 'log';
  timestamp: number;
}

interface WebhookStats {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  last_call: string | null;
}

export function WebhookMonitor() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState<WebhookStats>({
    total_calls: 0,
    successful_calls: 0,
    failed_calls: 0,
    last_call: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWebhookLogs = async () => {
    try {
      setRefreshing(true);
      
      // Use Supabase's analytics to get edge function logs
      const { data: analyticsData, error } = await supabase.rpc('get_function_logs', {
        function_name: 'lava-webhook'
      });

      if (error) {
        console.error('Failed to fetch webhook logs via RPC:', error);
        // Fallback: fetch recent payments to show webhook activity
        const { data: recentPayments } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        // Create mock logs from payments data
        const mockLogs = (recentPayments || []).map(payment => ({
          event_message: `Payment ${payment.status}: ${payment.email} - ${payment.amount} ${payment.currency}`,
          event_type: 'Payment',
          level: payment.status === 'completed' ? 'info' as const : 
                 payment.status === 'failed' ? 'error' as const : 
                 'warn' as const,
          timestamp: new Date(payment.created_at).getTime() * 1000
        }));
        
        setLogs(mockLogs);
        return;
      }

      // Parse logs if available
      const webhookLogs = analyticsData?.logs || [];
      setLogs(webhookLogs);
      
      const totalCalls = webhookLogs.filter((log: WebhookLog) => 
        log.event_message.includes('Webhook payload:')
      ).length;
      
      const failedCalls = webhookLogs.filter((log: WebhookLog) => 
        log.level === 'error'
      ).length;
      
      const lastCall = webhookLogs.length > 0 
        ? new Date(webhookLogs[0].timestamp / 1000).toISOString()
        : null;

      setStats({
        total_calls: totalCalls,
        successful_calls: totalCalls - failedCalls,
        failed_calls: failedCalls,
        last_call: lastCall
      });
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      
      // Fallback to payment data for basic monitoring
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (recentPayments) {
        const completedPayments = recentPayments.filter(p => p.status === 'completed').length;
        const failedPayments = recentPayments.filter(p => p.status === 'failed').length;
        const totalPayments = recentPayments.length;
        
        setStats({
          total_calls: totalPayments,
          successful_calls: completedPayments,
          failed_calls: failedPayments,
          last_call: recentPayments[0]?.created_at || null
        });
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookLogs();
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp / 1000).toLocaleString('ru');
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warn':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'info':
        return 'default';
      case 'warn':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhook Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего вызовов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_calls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Успешных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful_calls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ошибок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed_calls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Последний вызов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {stats.last_call 
                ? new Date(stats.last_call).toLocaleString('ru')
                : 'Нет данных'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook URL Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Webhook URL для настройки в Lava.top:</strong></p>
            <code className="bg-muted px-2 py-1 rounded text-sm">
              https://obtxzstpggaihoxnsarf.supabase.co/functions/v1/lava-webhook
            </code>
          </div>
        </AlertDescription>
      </Alert>

      {/* Webhook Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Логи Webhook</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchWebhookLogs}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Загрузка логов...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет логов webhook
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <Badge variant={getLevelVariant(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{log.event_type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {log.event_message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}