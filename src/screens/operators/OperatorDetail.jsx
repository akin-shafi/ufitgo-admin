import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ArrowLeft, Loader2, Mail, Phone, User, Building, Package, ExternalLink, ShieldCheck, ShieldAlert, CheckCircle
} from 'lucide-react';

const OperatorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: operator, isLoading } = useQuery({
    queryKey: ['operator-dossier', id],
    queryFn: () => api.get(`/admin/operator-auth/operators/${id}/dossier`).then(res => res.data)
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Operator Details">
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!operator) {
    return (
      <DashboardLayout title="Operator Details">
        <div className="text-center py-20">Operator not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Operator Details">
      <button 
        onClick={() => navigate('/operators')}
        className="flex items-center text-sm font-medium text-fg/60 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Operators
      </button>

      {/* Header Profile */}
      <div className="card p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-accent">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-3xl font-bold">
            {operator.companyName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
              {operator.companyName}
              {operator.verificationStatus === 'approved' && <ShieldCheck className="w-5 h-5 text-green-500" />}
            </h1>
            <div className="text-sm text-fg/60 flex items-center gap-3 mt-1">
              <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" />{operator.email}</span>
              {operator.phone && (
                <>
                  <span className="w-1 h-1 rounded-full bg-fg/20" />
                  <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" />{operator.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm font-bold bg-bg/50 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-fg/50 mr-2">Status:</span>
            {operator.isActive ? (
              <span className="text-green-500 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>
            ) : (
              <span className="text-red-500 flex items-center"><ShieldAlert className="w-3 h-3 mr-1" /> Inactive/Suspended</span>
            )}
          </div>
          <div className="flex items-center text-sm font-bold bg-bg/50 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-fg/50 mr-2">Verification:</span>
            {operator.verificationStatus === 'approved' && <span className="text-green-500 uppercase text-xs">Approved</span>}
            {operator.verificationStatus === 'pending' && <span className="text-yellow-500 uppercase text-xs">Pending</span>}
            {operator.verificationStatus === 'rejected' && <span className="text-red-500 uppercase text-xs">Rejected</span>}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 hide-scrollbar border-b border-border">
        {[
          { id: 'overview', label: 'Company Info', icon: Building },
          { id: 'businessOwner', label: 'Business Owner', icon: User },
          { id: 'packages', label: 'Service Packages', icon: Package },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center whitespace-nowrap px-4 py-3 text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'text-accent border-b-2 border-accent' 
                : 'text-fg/60 hover:text-fg hover:bg-bg/50'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-fg mb-4 flex items-center">
                <Building className="w-4 h-4 mr-2 text-accent" /> Company Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-fg/60">Operator ID</span>
                  <span className="font-medium text-fg">{operator.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-fg/60">Joined Date</span>
                  <span className="font-medium text-fg">{new Date(operator.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-fg/60">Partner Type</span>
                  <span className="font-medium text-fg uppercase">{operator.partnerType}</span>
                </div>
              </div>
            </div>
            
            <div className="card bg-accent/5 border-accent/20">
              <h3 className="font-bold text-fg mb-4 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-accent" /> Compliance
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-accent/10">
                  <span className="text-fg/60">Verification Status</span>
                  <span className={`font-medium ${
                    operator.verificationStatus === 'approved' ? 'text-green-600' : 'text-yellow-600'
                  } uppercase`}>
                    {operator.verificationStatus}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-accent/10">
                  <span className="text-fg/60">Account State</span>
                  <span className="font-medium text-fg">
                    {operator.isActive ? 'Active & Running' : 'Suspended'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS OWNER TAB */}
        {activeTab === 'businessOwner' && (
          <div className="card max-w-2xl">
            <h3 className="font-bold text-fg mb-6 flex items-center">
              <User className="w-5 h-5 mr-3 text-accent" /> Business Owner Profile
            </h3>
            
            {operator.businessOwner ? (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-fg/60">Full Name</span>
                  <span className="font-bold text-fg">{operator.businessOwner.firstName} {operator.businessOwner.lastName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-fg/60">Phone</span>
                  <span className="font-medium text-fg">{operator.businessOwner.phone}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-fg/60">NIN</span>
                  <span className="font-mono font-bold text-fg">{operator.businessOwner.nin || 'Not Provided'}</span>
                </div>
                {operator.businessOwner.idUrl && (
                  <div className="flex justify-between py-3 border-b border-border/50">
                    <span className="text-fg/60">Gov ID Document</span>
                    <a href={operator.businessOwner.idUrl} target="_blank" rel="noreferrer" className="flex items-center text-accent hover:underline font-bold">
                      View Document <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-fg/40 bg-bg/50 rounded-xl border border-dashed border-border">
                <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No business owner profile linked yet.</p>
              </div>
            )}
          </div>
        )}

        {/* PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-bold text-fg flex items-center">
                <Package className="w-5 h-5 mr-3 text-accent" /> Service Inventory
              </h3>
            </div>
            
            {!operator.packages || operator.packages.length === 0 ? (
              <div className="text-center py-12 text-fg/50">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No packages have been created by this operator.
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {operator.packages.map((pkg) => (
                  <div key={pkg.id} className="border border-border rounded-2xl overflow-hidden hover:border-accent transition-all group flex flex-col">
                    <div className="h-32 bg-bg/50 relative">
                      {pkg.bannerUrl ? (
                        <img src={pkg.bannerUrl} alt={pkg.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-fg/20">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {pkg.isActive ? (
                          <span className="px-2 py-1 bg-green-500/90 text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">Active</span>
                        ) : (
                          <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">Draft</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-sm mb-1 line-clamp-1">{pkg.title}</h4>
                      <div className="flex justify-between items-center text-xs text-fg/60 mt-auto pt-3 border-t border-border">
                        <span className="font-bold text-primary">₦{Number(pkg.price || 0).toLocaleString()}</span>
                        <span>{pkg.type || 'Custom'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default OperatorDetail;
