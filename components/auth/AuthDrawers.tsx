"use client";

import { useAuth } from "@/contexts/auth-context";
import { LoginDrawer } from "@/components/auth/login-drawer";
import { RegisterDrawer } from "@/components/auth/register-drawer";

export default function AuthDrawers() {
  const {
    loginDrawerOpen,
    registerDrawerOpen,
    openLoginDrawer,
    openRegisterDrawer,
    closeLoginDrawer,
    closeRegisterDrawer,
  } = useAuth();

  return (
    <>
      <LoginDrawer
        open={loginDrawerOpen}
        onOpenChange={(open) => (open ? openLoginDrawer() : closeLoginDrawer())}
        onSwitchToRegister={openRegisterDrawer}
      />
      <RegisterDrawer
        open={registerDrawerOpen}
        onOpenChange={(open) =>
          open ? openRegisterDrawer() : closeRegisterDrawer()
        }
        onSwitchToLogin={openLoginDrawer}
      />
    </>
  );
}