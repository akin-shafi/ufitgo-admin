import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Activity, Server, Database, Globe } from 'lucide-react';

const TechnicalMonitoringDashboard = () => {
  const services = [
    { name: 'UfitGo User API', status: 'operational', uptime: '99.99%', latency: '45ms' },
    { name: 'UfitGo Admin API', status: 'operational', uptime: '100%', latency: '32ms' },
    { name: 'UfitGo Operator Proxy', status: 'operational', uptime: '99.98%', latency: '89ms' },
    { name: 'Paystack Gateway', status: 'operational', uptime: '99.99%', latency: '120ms' },
    { name: 'SmileID Verification', status: 'degraded', uptime: '98.50%', latency: '850ms' },
    { name: 'AWS RDS Database', status: 'operational', uptime: '100%', latency: '5ms' },
    { name: 'Redis Cache', status: 'operational', uptime: '100%', latency: '2ms' },
  ];

  return (
    <DashboardLayout title="System Monitoring">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-fg">Infrastructure Health</h2>
        <p className="text-fg/60">Live status of internal microservices and third-party APIs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Server className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-fg/60">Services Online</p>
              <p className="text-2xl font-bold">6/7</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-fg/60">Avg Latency</p>
              <p className="text-2xl font-bold">163ms</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-fg/60">DB Load</p>
              <p className="text-2xl font-bold">12%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-fg/60">Active Incidents</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Service Status</h3>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-fg/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${service.status === 'operational' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse'}`}></div>
                <span className="font-medium text-fg">{service.name}</span>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-fg/60 w-24 text-right">
                  <span className="text-xs uppercase tracking-wider block mb-1">Uptime</span>
                  {service.uptime}
                </div>
                <div className="text-fg/60 w-24 text-right">
                  <span className="text-xs uppercase tracking-wider block mb-1">Latency</span>
                  {service.latency}
                </div>
                <div className={`w-28 text-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  service.status === 'operational' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {service.status}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-xs text-fg/40">
          Note: This is simulated data. The /admin/health aggregation endpoint needs to be implemented.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicalMonitoringDashboard;
