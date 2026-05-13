'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      fetch('/api/auth/me')
        .then((res) => {
          if (res.ok) {
            setVerified(true);
          } else {
            router.replace('/login');
          }
        })
        .catch(() => router.replace('/login'));
    }, [router]);

    if (!verified) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600/20 border-t-blue-600" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AuthComponent;
};

export default withAuth;
