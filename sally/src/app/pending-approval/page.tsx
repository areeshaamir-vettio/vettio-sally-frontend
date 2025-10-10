'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, Mail, CheckCircle, RefreshCw, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const handleRefresh = () => {
    // Instead of reloading the page, try to refresh auth status
    // This will check if the user has been approved
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-100/20 to-indigo-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-2xl backdrop-blur-sm border border-white/30">
                <div className="relative">
                  <Image
                    src="/assets/vettio-logo.png"
                    alt="Vettio Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#8952E0] to-[#7A47CC] rounded-full animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Vettio
                </span>
              </div>
            </div>

            {/* Animated Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg border border-purple-200/50">
                  <Clock className="w-12 h-12 text-[#8952E0] animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#8952E0] to-[#7A47CC] rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8952E0] via-[#7A47CC] to-[#8952E0] bg-clip-text text-transparent mb-4">
                Company Admin Approval Required
              </h1>
              <p className="text-gray-600 leading-relaxed text-lg">
                Your account is pending approval from your company administrator. Once approved,
                you'll have full access to the jobs platform and all its features.
              </p>
            </div>

            {/* Modern Progress Steps */}
            <div className="mb-8">
              <div className="bg-gray-50/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">Account Created</div>
                      <div className="text-sm text-gray-500">Your registration was successful</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#8952E0] to-[#7A47CC] rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">Admin Approval Pending</div>
                      <div className="text-sm text-gray-500">Company administrator reviewing your access request</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-400">Jobs Access Granted</div>
                      <div className="text-sm text-gray-400">Full platform access once approved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={handleRefresh}
                className="w-full bg-gradient-to-r from-[#8952E0] to-[#7A47CC] hover:from-[#7A47CC] hover:to-[#6B3BB8] text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Approval Status
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Help Section */}
            <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50">
              <p className="text-sm text-[#8952E0] font-medium mb-1">
                Need assistance?
              </p>
              <p className="text-xs text-[#7A47CC]">
                Contact your company administrator or our support team for questions about approval status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
